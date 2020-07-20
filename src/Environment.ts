import * as config from '../config';

if (!config.token) throw new Error('Token was not set!');
if (!config.appId) throw new Error('RPC application ID not set!');

export const MPRIS_IFACE = config.mprisInterface ?? 'org.mpris.MediaPlayer2.Player';
export const MPRIS_PATH = config.mprisPath ?? '/org/mpris/MediaPlayer2';
export const PROPERTIES_IFACE = config.propertiesInterface ?? 'org.freedesktop.DBus.Properties';
export const TOKEN = config.token;
export const APP_ID = config.appId;
export const DEBUG = !!config.debug;
export const SHOW_ALBUM_DETAILS = !!config.showAlbumDetails;
export const DISABLE_COVERS = !!config.disableCovers;
export const PLAYER = config.player ?? 'org.mpris.MediaPlayer2.NuvolaAppYoutubeMusic';
export const WHITELIST: string[] = [...(config.whiteList ?? []), 'default', 'playing', 'paused'];

if (!DISABLE_COVERS) console.warn('[config]', 'You have disabled covers functionality. You can change this setting in the config.js file');
