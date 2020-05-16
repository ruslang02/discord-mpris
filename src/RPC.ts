import util from "util";
import { Client } from "discord-rpc";
import { APP_ID as clientId, DEBUG } from "./Environment";
import MPRIS from "./MPRIS";
import Assets from "./Assets";
import { createLogger } from "./Console";

const { log } = createLogger("[rpc]");

export default class RPC {
	client: Client;
	mpris: MPRIS;
	assets: Assets;

	constructor() {
		this.client = new Client({ transport: "ipc" });
		this.mpris = new MPRIS();
		this.assets = new Assets();
	}

	async whenReady() {
		const { client, mpris, assets } = this;
		return Promise.all([
			assets.whenReady(),
			client.login({ clientId }),
			mpris.whenReady()
		]).then(() => {
			if(DEBUG) Object.assign(global, { rpc: this });
			mpris.on("update", this.update.bind(this))
			log("Ready.");
		});
	}

	async update() {
		let { client, mpris, assets } = this;
		const info = await mpris.getPlaying();

		log(util.format("%s %s, written by %s, %s/%s",
			info.state,
			info.title,
			info.artist,
			ms2str(info.current),
			ms2str(info.duration)));

		return client.setActivity({
			details: info.title,
			state: info.artist + " • " + info.album,
			largeImageKey: await assets.get(info),
			largeImageText: "Tell Ruzik this Rich Presence is cool",
			smallImageKey: info.state.toLowerCase(),
			smallImageText: info.state,
			startTimestamp: info.state === "Playing" ? new Date().getTime() - info.current : undefined,
		});
	}
}
function ms2str(durationPs: number) {
	const durationMs = durationPs / 1000;
	return Math.floor(durationMs / 60) +
		":" +
		(durationMs % 60 < 10 ? "0" : "") +
		Math.floor(durationMs % 60);
}