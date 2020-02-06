
declare module "*.var.svg" {
	interface VarSvg {
		/** The minified markup without metadata. */
		readonly markup: string;
		/** Render an instance of the represented svg. */
		render(): SVGElement;
	}
	const instance: VarSvg;
	export default instance;
}
