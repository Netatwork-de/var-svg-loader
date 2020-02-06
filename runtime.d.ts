
export interface VarSvg {
	/** The minified markup without metadata. */
	readonly markup: string;
	/** Render an instance of the represented svg. */
	render(): SVGElement;
}

declare module "*.var.svg" {
	const instance: VarSvg;
	export default instance;
}
