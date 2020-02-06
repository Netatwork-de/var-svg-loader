
const PREFAB = Symbol("prefab");

export class VarSvg {
	public constructor(public readonly markup: string) {
	}

	private [PREFAB]: SVGElement | null = null;

	public render() {
		if (this[PREFAB] === null) {
			const container = document.createElement("div");
			container.innerHTML = this.markup;
			this[PREFAB] = <SVGElement> container.removeChild(container.firstChild!);
		}
		return this[PREFAB]!.cloneNode(true);
	}
}
