import { Client } from "discord-rpc";
import { APP_ID as clientId } from "./Environment";
import MPRIS from "./MPRIS";
import Assets from "./Assets";
import { createLogger } from "./Console";
const {log} = createLogger("[rpc]");

export default class RPC {
	client: Client;
	mpris: MPRIS;
	assets: Assets;
	trackId: string = "";
	trackArt: string = "";
	trackStatus: string = "playing";

	constructor() {
		this.client = new Client({ transport: "ipc" });
		this.mpris = new MPRIS();
		this.assets = new Assets();
	}

	async whenReady() {
		const {client, mpris, assets} = this;
		return Promise.all([
			assets.whenReady(),
			client.login({ clientId }),
			mpris.whenReady()
		]).then(() => log("Ready."));
	}

	async update() {
		let {client, mpris, trackId, trackArt, trackStatus, assets, ms2str} = this;
		const playing = await mpris.getPlaying();
		log(`Playing ${playing.title}, written by ${playing.artist}, ${ms2str(playing.current / 1000)}/${ms2str(playing.duration / 1000)}`);
		if (playing.id != trackId) {
			trackId = playing.id;
			trackArt = await assets.upload(playing);
		}
		return client.setActivity({
			details: playing.title,
			state: playing.artist,
			largeImageKey: trackArt,
			largeImageText: "Cool, right?",
			smallImageKey: trackStatus,
			smallImageText: trackStatus[0].toUpperCase() + trackStatus.substring(1),
			startTimestamp: new Date().getTime() - playing.current,
		});
	}
	ms2str(durationMs: number): string {
		let duration = (durationMs / 60 < 1 ? "0" : "") + ":" + (durationMs % 60 < 10 ? "0" : "") + Math.floor(durationMs % 60);
		durationMs /= 60;
		return Math.floor(durationMs) + duration;
	}
}