import { loader } from "webpack";
import { getOptions } from "loader-utils";
import { parse as parseSVG, Node as SVGNode, ElementNode as SVGElementNode } from "svg-parser";
import { parse as parseCSS, stringify as stringifyCSS, Rule as CSSRule } from "css";
import htmlEscape = require("html-escape");
import { moduleTemplate } from "./module-template";

export interface VarSvgLoaderOptions {
	/**
	 * Called for every attribute or css value that could be parametized.
	 * @param value The raw value.
	 * @param location The location of the value consisting of elements in the following format:
	 * + `<foo>` - Represents an svg node.
	 * + `foo=` - Represents an svg node attribute name.
	 * + `foo:` - Represents a css property.
	 *
	 * _Css selector paths are not included for now._
	 *
	 * @returns nothing to leave the value as is or a string to replace it.
	 */
	parametize(this: loader.LoaderContext, value: string, location: string[]): string | void | undefined;
}

const excludePropNames = new Set(["id"]);
const excludeRootPropNames = new Set(["xmlns", "version"]);
const excludeProps: Array<(name: string, node: SVGElementNode) => boolean> = [
	name => excludePropNames.has(name),
	(name, node) => node.tagName === "svg" && excludeRootPropNames.has(name),
	name => /\:/.test(name)
];

interface CSSDeclaration {
	value?: string;
	property?: string;
}

export default function(this: loader.LoaderContext, source: string) {
	const options = <VarSvgLoaderOptions> getOptions(this) || {};
	if (typeof options.parametize !== "function") {
		throw new TypeError("options.parametize must be a function");
	}

	function processRule(this: loader.LoaderContext, rule: CSSRule, location: string[]) {
		for (const declaration of (<CSSDeclaration[]> rule.declarations || [])) {
			if (declaration.value && declaration.property) {
				const value = options.parametize.call(this, declaration.value, location.concat(`${declaration.property}:`));
				if (value !== undefined) {
					declaration.value = value;
				}
			}
		}
	}

	// Process the svg and format the final svg markup:
	const markup = (function walk(this: loader.LoaderContext, node: SVGNode, location: string[], parent: SVGElementNode | null): string {
		if (node.type === "element") {
			// Format svg node props:
			const props = Object.keys(node.properties || {})
				.filter(name => {
					// Exclude metadata and xml specific props:
					return !excludeProps.some(test => test(name, node));
				})
				.map(name => {
					if (name === "style") {
						// Process properties in style properties:
						const css = parseCSS(`*{${getProperty(node, name)}}`);
						processRule.call(this, css.stylesheet!.rules[0], location.concat(`<${node.tagName}>`, `${name}=`));
						return ` ${name}="${htmlEscape(stringifyCSS(css, { compress: true }).slice(2, -1))}"`;
					} else {
						// Process attributes:
						const value = options.parametize.call(this, getProperty(node, name)!, location.concat(`<${node.tagName}>`, `${name}=`));
						if (value !== undefined) {
							return ` ${name}="${htmlEscape(value)}"`;
						}
					}
					return ` ${name}="${htmlEscape(getProperty(node, name)!)}"`;
				})
				.join("");

			// Format svg node:
			return node.children.length > 0
				? `<${node.tagName}${props}>${
					node.children.map(child => {
						if (typeof child === "string") {
							throw new TypeError("Found invalid text child.");
						}
						return walk.call(this, child, location.concat(`<${node.tagName}>`), node);
					}).join("")
				}</${node.tagName}>`
				: `<${node.tagName}${props}/>`;
		} else {
			let value = String(node.value);
			// Process css properties in <style> tags:
			if (parent !== null && parent.tagName === "style" && getProperty(parent, "type") === "text/css") {
				const css = parseCSS(value);
				for (const rule of css.stylesheet!.rules) {
					if (rule.type === "rule") {
						processRule.call(this, rule, location);
					} else if (rule.type !== "comment") {
						throw new TypeError(`Unsuzpported css node type: ${node.type}`);
					}
				}
				value = stringifyCSS(css, { compress: true });
			}
			// Collapse text whitespace:
			return value.split(/\s*[\r\n]\s*/g).filter(l => l).join(" ");
		}
	}).call(this, parseSVG(source).children[0], [], null);

	return moduleTemplate(markup);
}

function getProperty(node: SVGElementNode, name: string) {
	return (node.properties && (name in node.properties)) ? String(node.properties[name]) : undefined;
}
