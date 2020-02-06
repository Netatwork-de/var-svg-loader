
declare module "unionfs" {
	import { Volume } from "memfs";

	export class Union extends Volume {
		public constructor();
		public use(fs: any): this;
	}
}
