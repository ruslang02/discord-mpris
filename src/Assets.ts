import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import axios, { AxiosError } from 'axios';
import { Hash, createHash } from 'crypto';

import {
  TOKEN, APP_ID, DEBUG, WHITELIST,
} from './Environment';
import { PlayerInfo } from './MPRIS';
import createLogger from './Console';
import { isURL } from './Utilities';

const {
  log, warn, debug, error,
} = createLogger('[assets]');
const discord = axios.create({
  baseURL: `https://discord.com/api/v6/oauth2/applications/${APP_ID}`,
});
discord.defaults.headers.common.Authorization = TOKEN;

type AssetId = string;

type Asset = {
  id: AssetId;
  type: 1;
  name: string;
};

type Application = {
  id: string;
  name: string;
  // more to it that we don't need
};

export default class Assets {
  application: Application | null = null;

  cache: Set<Asset> | null = null;

  hash: Hash = createHash('MD5');

  async whenReady(): Promise<void> {
    const { data } = await discord.get<Application>('');
    log(`Working with "${data.name}" (ID: ${data.id})...`);
    this.application = data;
    return this.loadCache();
  }

  async loadCache(): Promise<void> {
    const { data } = await discord.get<Asset[]>('/assets');
    this.cache = new Set(data);

    if (DEBUG) Object.assign(global, { assets: this });
    log(`${this.cache.size} assets loaded into cache`);
  }

  private async upload(name: string, image: string): Promise<AssetId> {
    const { cache } = this;
    if (!cache) return 'yt';
    const asset = {
      name,
      type: '1', // What is this for?
      image,
    };
    log(`Attempting to upload ${name}...`);
    try {
      const { data } = await discord.post<Asset>('/assets', asset);
      log(`Uploaded album art. ID: ${data.id}`);
      cache.add(data);
      return name;
    } catch (ex) {
      const { isAxiosError, response } = ex as AxiosError;
      if (isAxiosError) {
        if (response?.status === 400) {
          if (response.data.code === 30017) {
            await this.purge();
            return this.upload(name, image);
          }
        }
      }
      error(ex);
      return 'yt';
    }
  }

  purge(): Promise<string[]> {
    const { cache } = this;
    if (!cache) throw new Error('No cache found.');

    const promises: Promise<string>[] = [];
    let total = 0;
    cache.forEach((asset) => {
      if (total > 5) return;
      if (!WHITELIST.includes(asset.id)) promises.push(this.delete(asset.id));
      total += 1;
    });
    return Promise.all(promises);
  }

  async delete(id: string): Promise<string> {
    const { cache } = this;
    if (!cache) throw new Error('No cache found.');
    log(`Deleting ${id}...`);

    const { data, status } = await discord.delete<Asset>(`/assets/${id}`);
    if (status >= 300) error(`Unable to delete asset ${id}: ${data}`);
    cache.forEach((asset) => {
      if (asset.id === id) cache.delete(asset);
    });
    return id;
  }

  async get(player: PlayerInfo): Promise<AssetId> {
    const { cache, hash } = this;
    if (!cache) {
      warn('Attempted to upload art before downloading cache, skipping.');
      return 'yt';
    }
    if (!isURL(player.art)) {
      debug('This song does not contain an album art.');
      return 'yt';
    }

    const imagePath = fileURLToPath(player.art);
    const buffer = await fs.readFile(imagePath);
    const image = `data:image/jpg;base64,${buffer.toString('base64')}`;

    hash.update(image);
    const name = hash.digest('hex');
    hash.destroy();
    this.hash = createHash('MD5');
    let result = '';
    cache.forEach((asset) => {
      if (asset.name === name) result = name;
    });
    return result || this.upload(name, image);
  }
}
