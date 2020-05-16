import DBus, { ProxyObject, ClientInterface } from "dbus-next";
import { MPRIS_IFACE, MPRIS_PATH, PROPERTIES_IFACE, PLAYER, DEBUG } from "./Environment";
import { createLogger } from "./Console";
import { EventEmitter } from "events";

const { log, debug } = createLogger("[mpris]");

export type PlayerInfo = {
	title: string,
	artist: string,
	album: string,
	duration: number,
	current: number,
	art: string,
	id: string,
	state: string
}

export default class MPRIS extends EventEmitter {
	bus: DBus.MessageBus;
	mpris: ProxyObject | null = null;
	player: ClientInterface | null = null;
	props: ClientInterface | null = null;

	constructor() {
		super();
		this.bus = DBus.sessionBus();
	}

	async whenReady() {
		let { bus, emit } = this;

		this.mpris = await bus.getProxyObject(PLAYER, MPRIS_PATH);
		this.player = this.mpris.getInterface(MPRIS_IFACE);
		this.props = this.mpris.getInterface(PROPERTIES_IFACE);

		this.props.on("PropertiesChanged", this.emit.bind(this, "update"));
		if (DEBUG) Object.assign(global, { mpris: this });

		log("Ready.");
	}

	private getString(props: any, key: string = ""): string {
		if (!props)
			return "";
		if (key === "")
			return props.value.trim();
		if (props.value[key] === undefined)
			return "";
		if (typeof props.value[key].value === "string")
			return props.value[key].value.trim();
		if (typeof props.value[key].value === "object" && props.value[key].value.length !== 0)
			return props.value[key].value[0].toString().trim();
		return "";
	}

	private getNumber(props: any, key: string = ""): number {
		if (!props)
			return 0;
		if (key === "")
			return Number(props.value);
		if (props.value[key] === undefined)
			return 0;
		if (typeof props.value[key].value !== "object")
			return Number(props.value[key].value);
		if (props.value[key].value.length !== 0)
			return Number(props.value[key].value[0]);
		return 0;
	}

	async getPlaying(): Promise<PlayerInfo> {
		const { props, getNumber, getString } = this;
		let metadata: any = await props?.Get(MPRIS_IFACE, "Metadata");
		let position: any = await props?.Get(MPRIS_IFACE, "Position");
		let state: any = await props?.Get(MPRIS_IFACE, "PlaybackStatus");
		return {
			title: getString(metadata, "xesam:title"),
			artist: getString(metadata, "xesam:artist"),
			album: getString(metadata, "xesam:album"),
			duration: getNumber(metadata, "mpris:length") / 1000,
			current: getNumber(position) / 1000,
			art: getString(metadata, "mpris:artUrl"),
			id: getString(metadata, "mpris:trackid"),
			state: getString(state)
		}
	}
}