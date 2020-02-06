
declare module "@netatwork/var-svg-loader/runtime" {
	export interface VarSvg {
		/** The minified markup without metadata. */
		readonly markup: string;
		/** Render an instance of the represented svg. */
		render(): SVGSVGElement;
	}
}

declare module "*.var.svg" {
	import { VarSvg } from "@netatwork/var-svg-loader/runtime";

	const instance: VarSvg;
	export default instance;
}
