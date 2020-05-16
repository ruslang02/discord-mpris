if (!process.env.TOKEN)
	throw new Error("Token was not set!");
if (!process.env.APP_ID)
	throw new Error("RPC application ID not set!");

export const MPRIS_IFACE = process.env.MPRIS_IFACE ?? 'org.mpris.MediaPlayer2.Player';
export const MPRIS_PATH = process.env.MPRIS_PATH ?? '/org/mpris/MediaPlayer2';
export const PROPERTIES_IFACE = process.env.PROPERTIES_IFACE ?? 'org.freedesktop.DBus.Properties';
export const UPDATE_RATE = parseInt(process.env.UPDATE_RATE ?? "10000") ?? 10000;
export const TOKEN = process.env.TOKEN as string;
export const APP_ID = process.env.APP_ID as string;
export const DEBUG = process.env.DEBUG === "true";
export const PLAYER =
	typeof process.env.PLAYER === "string" ?
		process.env.PLAYER as string : "org.mpris.MediaPlayer2.NuvolaAppYoutubeMusic";