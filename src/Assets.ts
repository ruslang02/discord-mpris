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
/**
 * Manages Rich Presence assets using Discord REST API.
 */
export default class Assets {
  /**
   * Rich Presence application which is being controlled.
   */
  application: Application | null = null;

  /**
   * Cache for Rich Presence assets which ensures assets are not uploaded more than once.
   */
  cache: Set<Asset> | null = null;

  /**
   * MD5 hash crypto function.
   */
  hash: Hash = createHash('MD5');

  /**
   * Initializes application.
   */
  async whenReady(): Promise<void> {
    const { data } = await discord.get<Application>('');
    log(`Working with "${data.name}" (ID: ${data.id})...`);
    this.application = data;
    return this.loadCache();
  }

  /**
   * Preloads cached assets.
   */
  async loadCache(): Promise<void> {
    const { data } = await discord.get<Asset[]>('/assets');
    this.cache = new Set(data);

    if (DEBUG) Object.assign(global, { assets: this });
    log(`${this.cache.size} assets loaded into cache`);
  }

  /**
   * Uploads a Rich Presence asset to the API.
   * @param name ID of the asset.
   * @param image Album art data.
   */
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

  /**
   * Purges oldest album arts from the Rich Presence assets.
   * @param amount Number of assets to delete.
   */
  purge(amount = 5): Promise<string[]> {
    const { cache } = this;
    if (!cache) throw new Error('No cache found.');

    const promises: Promise<string>[] = [];
    let total = 0;
    cache.forEach((asset) => {
      if (total > amount) return;
      if (!WHITELIST.includes(asset.id)) promises.push(this.delete(asset.id));
      total += 1;
    });
    return Promise.all(promises);
  }

  /**
   * Deletes an asset from the Rich Presence asset list.
   * @param id Asset ID to delete.
   */
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

  /**
   * Gets the album art's ID from the cache or uploads the art to the API.
   * @param artUrl Album art's file URL.
   */
  async get(artUrl: string): Promise<AssetId> {
    const { cache, hash } = this;
    if (!cache) {
      warn('Attempted to upload art before downloading cache, skipping.');
      return 'yt';
    }
    if (!isURL(artUrl)) {
      debug('This song does not contain an album art.');
      return 'yt';
    }

    const imagePath = fileURLToPath(artUrl);
    const buffer = await fs.readFile(imagePath);
    const image = `data:image/jpg;base64,${buffer.toString('base64')}`;

    hash.update(image);
    const name = hash.digest('hex');
    hash.destroy();
    // We generate an MD5 checksum to compare with other images in the cache.

    this.hash = createHash('MD5');
    let result = '';
    cache.forEach((asset) => {
      if (asset.name === name) result = name;
    });
    return result || this.upload(name, image);
  }
}
