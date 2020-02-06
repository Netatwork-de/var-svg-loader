import test from "ava";
import { runWebpackBundle } from "./_webpack";

test("minification", async t => {
	const markup = await runWebpackBundle(t, {
		src: {
			"./icon.var.svg": `
				<?xml version="1.0" encoding="utf-8"?>
				<!-- Some comment -->
				<svg version="1.1" id="idsShouldBeIgnored" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
				viewBox="0 0 42 42" xml:space="preserve">
					<style type="text/css">
						/* Some comment */
						.foo {
							color: red;
						}
						.bar {
							color: #007FFF;
						}
					</style>
					<path class="foo" d="M95.5,19.2H34.6c-1.6" />
					<polygon class="bar" points="47.1,8.9 58.6,8.9 58.6,4.5" />
				</svg>
			`,

			"./index.js": `
				import icon from "./icon.var.svg";
				resolve(icon.markup);
			`
		}
	});

	t.is(markup, `<svg viewBox="0 0 42 42"><style type="text/css">.foo{color:red;}.bar{color:#007FFF;}</style><path class="foo" d="M95.5,19.2H34.6c-1.6"/><polygon class="bar" points="47.1,8.9 58.6,8.9 58.6,4.5"/></svg>`);
});

test("parametize hooks", async t => {
	const params: [string, string[]][] = [];
	const markup = await runWebpackBundle(t, {
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
				resolve(icon.markup);
			`
		},
		parametize(value, location) {
			params.push([value, location]);
			if (value === "#007FFF") {
				return "var(--bar)";
			}
			if (location.slice(-1)[0] === "viewBox=") {
				return "1 3 3 7";
			}
			if (location.slice(-2).join(" ") === "style= color:") {
				return "green";
			}
		}
	});

	t.is(markup, `<svg viewBox="1 3 3 7"><style type="text/css">.foo{color:var(--bar);}</style><path class="foo" d="M95.5,19.2H34.6c-1.6"/><polygon points="47.1,8.9 58.6,8.9 58.6,4.5" style="color:green;"/></svg>`);

	t.deepEqual(params, [
		["0 0 42 42", ["<svg>", "viewBox="]],
		["text/css", ["<svg>", "<style>", "type="]],
		["#007FFF", ["<svg>", "<style>", "color:"]],
		["foo", ["<svg>", "<path>", "class="]],
		["M95.5,19.2H34.6c-1.6", ["<svg>", "<path>", "d="]],
		["47.1,8.9 58.6,8.9 58.6,4.5", ["<svg>", "<polygon>", "points="]],
		["red", ["<svg>", "<polygon>", "style=", "color:"]]
	]);
});
