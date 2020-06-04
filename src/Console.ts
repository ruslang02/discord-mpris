import { DEBUG } from './Environment';

export default function createLogger(...prefix: any[]): {
  debug: Function;
  log: Function;
  warn: Function;
  error: Function;
} {
  return {
    debug: DEBUG ? console.log.bind(console, '[debug]', ...prefix) : (): void => undefined,
    log: console.log.bind(console, ...prefix),
    warn: console.log.bind(console, '[warn]', ...prefix),
    error: console.error.bind(console, '[error]', ...prefix),
  };
}
