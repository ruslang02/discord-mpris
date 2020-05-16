import { Client } from "discord.js";
import { TOKEN, APP_ID, ENDPOINT } from "./Environment";
import { OAuth2Application } from "discord.js";
import { PlayerInfo } from "./MPRIS";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { createLogger } from "./Console";
const md5 = require("md5");
const {log} = createLogger("[assets]");

// TODO: Using discord.js is probably an overkill here...
export default class Assets {
	client: Client;
	application: OAuth2Application | null = null;
	constructor() {
		this.client = new Client();
	}
	async whenReady() {
		let { client } = this;
		await client.login(TOKEN);
		this.application = await client.fetchApplication(APP_ID);
		log(`Ready. Working with "${this.application.name}" (ID: ${this.application.id})...`);
	}
	async upload(player: PlayerInfo) {
		const imagePath = fileURLToPath(player.art);
		const buffer = await fs.readFile(imagePath);
		const image = "data:image/jpg;base64," + buffer.toString('base64');
		const name = md5(image);
		for (const asset of await this.request('get'))
			if (asset.name === name)
				return name;

		const data = {
			name,
			type: "2",
			image
		}
		const updated = await this.request('post', data);
		log("Uploaded album art", updated);
		return name;
	}
	private async request(method: string, data: any = undefined) {
		//@ts-ignore
		return this.client["rest"].makeRequest(method, ENDPOINT, true, data);
	}
}