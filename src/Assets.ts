import { TOKEN, APP_ID, DEBUG } from "./Environment";
import { PlayerInfo } from "./MPRIS";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { createLogger } from "./Console";
import axios from "axios";
import { Hash, createHash } from "crypto";

const { log, warn } = createLogger("[assets]");
const discord = axios.create({
	baseURL: `https://discord.com/api/v6/oauth2/applications/${APP_ID}`
});
discord.defaults.headers.common['Authorization'] = TOKEN;

type AssetId = string;

type Asset = {
	id: AssetId;
	type: 1;
	name: string;
}

type Application = {
	id: string;
	name: string;
	// more to it that we don't need
}

export default class Assets {
	application: Application | null = null;
	cache: Set<AssetId> | null = null;
	hash: Hash = createHash('MD5');

	async whenReady() {
		const { data } = await discord.get<Application>("");
		log(`Working with "${data.name}" (ID: ${data.id})...`);
		this.application = data;
		return this.loadCache();
	}
	async loadCache() {
		const { data } = await discord.get<Asset[]>("/assets");
		this.cache = new Set(data.map(a => a.name));

		if(DEBUG) Object.assign(global, { assets: this });
		log(`${this.cache.size} assets loaded into cache`)
	}

	private async upload(name: string, image: string) {
		let { cache } = this;
		const asset = {
			name,
			type: "1", // What is this for?
			image
		}
		const { data } = await discord.post<Asset>('/assets', asset);
		log("Uploaded album art", data);

		cache?.add(data.name);
		return name;
	}

	async get(player: PlayerInfo): Promise<AssetId> {
		let { cache, hash } = this;
		if (!cache) {
			warn("Attempted to upload art before downloading cache, skipping.");
			return "yt";
		}

		const imagePath = fileURLToPath(player.art);
		const buffer = await fs.readFile(imagePath);
		const image = "data:image/jpg;base64," + buffer.toString('base64');

		hash.update(image);
		const name = hash.digest("hex");
		hash.destroy();
		this.hash = createHash('MD5');

		if (cache.has(name))
			return name;
		else
			return this.upload(name, image)
	}
}