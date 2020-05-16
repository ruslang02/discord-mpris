import RPC from "./RPC";
import { UPDATE_RATE } from "./Environment";

const rpc = new RPC();

rpc.whenReady().then(rpc.update.bind(rpc));