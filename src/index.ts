import RPC from './RPC';
import { DEBUG } from './Environment';

const rpc = new RPC();

rpc.whenReady().then(rpc.update.bind(rpc)).catch((error: Error) => {
  console.error(error.message);
  if (DEBUG) console.error(error);
  process.exit(1);
});
