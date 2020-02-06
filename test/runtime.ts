import test from "ava";
import { runWebpackBundle } from "./_webpack";

test("render", async t => {
	const [icon, _SVGSVGElement]: [SVGSVGElement, typeof SVGSVGElement] = await runWebpackBundle(t, {
		src: {
			"./icon.var.svg": `
				<svg viewBox="0 0 42 42">
					<style type="text/css">
						.foo {
							color: #007FFF;
						}
					</style>
					<path class="foo" d="M95.5,19.2H34.6c-1.6" />
					<polygon points="47.1,8.9 58.6,8.9 58.6,4.5" style="color: red;" />
				</svg>
			`,
			"./index.js": `
				import icon from "./icon.var.svg";
				resolve([icon.render(), SVGSVGElement]);
			`
		}
	});

	t.true(icon instanceof _SVGSVGElement);
	t.is(icon.parentNode, null);
	t.is(icon.outerHTML, `<svg viewBox="0 0 42 42"><style type="text/css">.foo{color:#007FFF;}</style><path class="foo" d="M95.5,19.2H34.6c-1.6"></path><polygon points="47.1,8.9 58.6,8.9 58.6,4.5" style="color:red;"></polygon></svg>`);
});
