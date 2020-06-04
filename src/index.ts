import RPC from './RPC';

const rpc = new RPC();

rpc.whenReady().then(rpc.update.bind(rpc));
