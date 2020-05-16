import { Constants } from "discord.js";
const { Endpoints } = Constants;
declare module 'discord.js' {
	export class Constants {
		public static Endpoints: any;
	}
}

if (!process.env.TOKEN)
	throw new Error("Token was not set!");
if (!process.env.APP_ID)
	throw new Error("RPC application ID not set!");

export const MPRIS_IFACE = process.env.MPRIS_IFACE ?? 'org.mpris.MediaPlayer2.Player';
export const MPRIS_PATH = process.env.MPRIS_PATH ?? '/org/mpris/MediaPlayer2';
export const PROPERTIES_IFACE = process.env.PROPERTIES_IFACE ?? 'org.freedesktop.DBus.Properties';
export const UPDATE_RATE = parseInt(process.env.UPDATE_RATE ?? "30000") ?? 30000;
export const TOKEN = process.env.TOKEN as string;
export const APP_ID = process.env.APP_ID as string;
export const ENDPOINT = Endpoints.OAUTH2.Application(APP_ID).toString() + "/assets";
export const DEBUG = process.env.DEBUG === "true";
export const PLAYER =
	typeof process.env.PLAYER === "string" ?
		process.env.PLAYER as string : "org.mpris.MediaPlayer2.NuvolaAppYoutubeMusic";