import util from 'util';
import { Client } from 'discord-rpc';
import { APP_ID as clientId, DEBUG } from './Environment';
import MPRIS from './MPRIS';
import Assets from './Assets';
import createLogger from './Console';
import { ms2str } from './Utilities';

const { log, warn } = createLogger('[rpc]');

/**
 * A Discord RPC client used to send Rich Presence info.
 */
export default class RPC {
  /**
   * Discord RPC client.
   */
  client: Client;

  /**
   * MPRIS fetcher instance.
   */
  mpris: MPRIS;

  /**
   * Discord Assets API instance.
   */
  assets: Assets;

  constructor() {
    this.client = new Client({ transport: 'ipc' });
    this.mpris = new MPRIS();
    this.assets = new Assets();
  }

  /**
   * Initializes all instances.
   */
  whenReady(): Promise<void | void[]> {
    const { client, mpris, assets } = this;
    return Promise.all([
      assets.whenReady(),
      client.login({ clientId }),
      mpris.whenReady(),
    ]).then(() => {
      if (DEBUG) Object.assign(global, { rpc: this });
      mpris.on('update', this.update.bind(this));
      log('Ready.');
    });
  }

  /**
   * Updates RPC Presence info.
   */
  async update(): Promise<void> {
    const { client, mpris, assets } = this;
    const info = await mpris.getPlaying();

    log(util.format('%s %s, written by %s, %s/%s',
      info.state,
      info.title,
      info.artist,
      ms2str(info.current),
      ms2str(info.duration)));
    try {
      await client.setActivity({
        details: info.title || 'No title',
        state: (info.artist || 'No artist') + (info.album ? ` • ${info.album}` : ''),
        largeImageKey: await assets.get(info),
        largeImageText: 'Tell Ruzik this Rich Presence is cool',
        smallImageKey: info.state.toLowerCase(),
        smallImageText: info.state,
        startTimestamp: info.state === 'Playing' ? new Date().getTime() - info.current : undefined,
      });
    } catch (ex) {
      warn(`Couldn't update Rich Presence: ${ex}`);
    }
  }
}
