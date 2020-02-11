import test from "ava";
import { runWebpackBundle } from "./_webpack";
import { colors, oneOf } from "../src";

test("colors", async t => {
	const markup = await runWebpackBundle(t, {
		src: {
			"./icon.var.svg": `
				<svg style="fill: red; stroke: rgb(0, 127, 255)">
					<rect fill="#00ff007f" />
					<path stroke="#000" />
				</svg>
			`,
			"./index.js": `
				import icon from "./icon.var.svg";
				resolve(icon.markup);
			`
		},
		parametize: colors({
			prefix: "--test-",
			colors: {
				a: "#f00",
				b: "#007FFF",
				c: "rgb(0, 255, 0, 0.5)",
				d: "black"
			}
		})
	});
	t.is(markup, `<svg style="fill:var(--test-a);stroke:var(--test-b);"><rect fill="var(--test-c)"/><path stroke="var(--test-d)"/></svg>`);
});

test("oneOf", async t => {
	const markup = await runWebpackBundle(t, {
		src: {
			"./icon.var.svg": `
				<svg a="foo" b="bar" />
			`,
			"./index.js": `
				import icon from "./icon.var.svg";
				resolve(icon.markup);
			`
		},
		parametize: oneOf(
			value => {
				if (value === "bar") {
					return "7";
				}
			},
			() => {
				return "42";
			}
		)
	});
	t.is(markup, `<svg a="42" b="7"/>`);
});
