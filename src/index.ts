import RPC from "./RPC";
import { UPDATE_RATE } from "./Environment";

const rpc = new RPC();

rpc.whenReady().then(() => {
	console.log(`[main] Updating RPC every ${UPDATE_RATE / 1000} seconds.`);

	setInterval(rpc.update.bind(rpc), UPDATE_RATE);
	rpc.update();
});