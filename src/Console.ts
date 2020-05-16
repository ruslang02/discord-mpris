import {DEBUG} from "./Environment";

export function createLogger(...prefix: any[]) {
	return {
		debug: DEBUG ? console.log.bind(console, "[debug]", ...prefix) : () => {},
		log: console.log.bind(console, ...prefix),
		warn: console.log.bind(console, "[warn]", ...prefix),
		error: console.error.bind(console, "[error]", ...prefix)
	};
}