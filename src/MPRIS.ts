import DBus, { ProxyObject, ClientInterface, DBusError } from 'dbus-next';
import { EventEmitter } from 'events';
import {
  MPRIS_IFACE, MPRIS_PATH, PROPERTIES_IFACE, PLAYER, DEBUG,
} from './Environment';
import createLogger from './Console';
import { getString, getNumber } from './Utilities';

const { log } = createLogger('[mpris]');

export type PlayerInfo = {
  title: string;
  artist: string;
  album: string;
  duration: number;
  current: number;
  art: string;
  id: string;
  state: string;
};
/**
 * Manages MPRIS players using `dbus-next`.
 */
export default class MPRIS extends EventEmitter {
  bus: DBus.MessageBus;

  mpris: ProxyObject | null = null;

  player: ClientInterface | null = null;

  props: ClientInterface | null = null;

  constructor() {
    super();
    this.bus = DBus.sessionBus();
  }

  /**
   * Initializes D-Bus interfaces.
   */
  async whenReady(): Promise<void> {
    const { bus } = this;
    try {
      this.mpris = await bus.getProxyObject(PLAYER, MPRIS_PATH);
      this.player = this.mpris.getInterface(MPRIS_IFACE);
      this.props = this.mpris.getInterface(PROPERTIES_IFACE);
      this.props.on('PropertiesChanged', this.emit.bind(this, 'update'));
    } catch (e) {
      const err = e as DBusError;
      throw new Error(`MPRIS initialization failed. ${err.text}`);
    }
    if (DEBUG) Object.assign(global, { mpris: this });

    log('Ready.');
  }

  /**
   * Gets a currently playing song.
   */
  async getPlaying(): Promise<PlayerInfo> {
    const { props } = this;
    const metadata = await props?.Get(MPRIS_IFACE, 'Metadata');
    const position = await props?.Get(MPRIS_IFACE, 'Position');
    const state = await props?.Get(MPRIS_IFACE, 'PlaybackStatus');
    return {
      title: getString(metadata, 'xesam:title') || 'No title',
      artist: getString(metadata, 'xesam:artist') || 'No artist',
      album: getString(metadata, 'xesam:album'),
      duration: getNumber(metadata, 'mpris:length') / 1000,
      current: getNumber(position) / 1000,
      art: getString(metadata, 'mpris:artUrl'),
      id: getString(metadata, 'mpris:trackid'),
      state: getString(state),
    };
  }
}
