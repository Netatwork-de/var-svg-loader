import { VarSvgParametize } from ".";
import * as color from "color";

export interface ParametizeColors {
	readonly prefix: string;
	readonly colors: Record<string, string>;
}

const colorLocations = new Set([
	"stroke=",
	"stroke:",
	"fill=",
	"fill:"
]);

function normalizeColor(value: string) {
	return color(value).rgb().string();
}

export function colors(config: ParametizeColors): VarSvgParametize {
	const replace = new Map<string, string>();
	for (const name in config.colors) {
		replace.set(normalizeColor(config.colors[name]), `var(${config.prefix}${name})`);
	}
	return (value: string, location: string[]) => {
		if (colorLocations.has(location[location.length - 1])) {
			return replace.get(normalizeColor(value));
		}
	};
}

export function oneOf(...fns: VarSvgParametize[]): VarSvgParametize {
	return function(value: string, location: string[]) {
		for (const fn of fns) {
			const result = fn.call(this, value, location);
			if (result !== undefined) {
				return result;
			}
		}
	}
}
