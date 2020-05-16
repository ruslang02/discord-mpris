import DBus, { ProxyObject, ClientInterface } from "dbus-next";
import { MPRIS_IFACE, MPRIS_PATH, PROPERTIES_IFACE, PLAYER } from "./Environment";
import { createLogger } from "./Console";

const {log, debug} = createLogger("[mpris]");

export type PlayerInfo = {
	title: string,
	artist: string,
	duration: number,
	current: number,
	art: string,
	id: string
}

export default class MPRIS {
	bus: DBus.MessageBus;
	mpris: ProxyObject | null = null;
	player: ClientInterface | null = null;
	props: ClientInterface | null = null;

	constructor() {
		this.bus = DBus.sessionBus();
	}

	async whenReady() {
		let {bus} = this;

		this.mpris = await bus.getProxyObject(PLAYER, MPRIS_PATH);
		this.player = this.mpris.getInterface(MPRIS_IFACE);
		this.props = this.mpris.getInterface(PROPERTIES_IFACE);
		log("Ready.");
	}

	async getPlaying(): Promise<PlayerInfo> {
		const {props} = this;
		let metaData: any = await props?.Get(MPRIS_IFACE, "Metadata");
		let posData: any = await props?.Get(MPRIS_IFACE, "Position");
		return {
			title: metaData.value["xesam:title"].value.trim(),
			artist: metaData.value["xesam:artist"].value.length ? metaData.value["xesam:artist"].value[0].trim() : "",
			duration: Number(metaData.value["mpris:length"].value) / 1000,
			current: Number(posData.value) / 1000,
			art: metaData.value["mpris:artUrl"].value,
			id: metaData.value["mpris:trackid"].value
		}
	}
}