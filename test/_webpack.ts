/// <reference path="./_unionfs.d.ts" />

import { ExecutionContext } from "ava";
import { join, posix } from "path";
import webpack = require("webpack");
import { Volume } from "memfs";
import { Union } from "unionfs";
import * as fs from "fs";
import { createContext, runInContext } from "vm";
import { JSDOM } from "jsdom";
import { VarSvgLoaderOptions } from "../src";
import { DirectoryJSON } from "memfs/lib/volume";

export interface RunWebpackOptions extends Partial<VarSvgLoaderOptions> {
	src: DirectoryJSON;
	env?: any;
}

export async function runWebpackBundle(t: ExecutionContext, options: RunWebpackOptions) {
	const srcRoot = join(__dirname, "_src");
	const distRoot = join(__dirname, "_dist");

	const compiler = webpack({
		mode: "production",
		target: "node",
		context: join(__dirname, "../.."),
		entry: srcRoot,
		output: {
			path: distRoot,
			filename: "index.js"
		},
		module: {
			rules: [
				{
					test: /\.var.svg$/,
					loader: require.resolve("../src"),
					options: <VarSvgLoaderOptions> {
						parametize: options.parametize || (() => {})
					}
				}
			]
		}
	});

	const src = Volume.fromJSON(options.src, srcRoot);
	const dist = Volume.fromJSON({}, distRoot);

	compiler.inputFileSystem = <any> new Union().use(fs).use(src);
	compiler.outputFileSystem = <any> Object.assign(Object.create(dist), posix);

	const stats = await new Promise<webpack.Stats>((resolve, reject) => {
		compiler.run((error, stats) => error ? reject(error) : resolve(stats));
	});
	if (stats.hasWarnings()) {
		for (const message of stats.toJson({ all: false, warnings: true }).warnings) {
			t.log(message);
		}
	}
	if (stats.hasErrors()) {
		throw stats.toJson({ all: false, errors: true }).errors;
	}

	const bundleFilename = join(distRoot, "index.js");
	const bundle = <string> dist.readFileSync(bundleFilename, "utf8");

	return new Promise<any>((resolve, reject) => {
		const dom = new JSDOM(`<!DOCTYPE html><html></html>`);
		Object.assign(dom.window, options.env || {}, {
			console,
			resolve,
			reject
		});
		const sandbox = createContext(dom.window);
		runInContext(bundle, sandbox, { filename: bundleFilename });
	});
}
