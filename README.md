# @netatwork/var-svg-loader
A webpack loader for parametizing svgs at build time.

## Installation
```shell
npm i -D var-svg-loader
```

## Usage
```js
// Add the following rule to your webpack config:
{
	test: /\.var\.svg$/,
	loader: "@netatwork/var-svg-loader",
	options: {
		parametize(value, location) {
			if (value === "#0007FF") {
				return "var(--my-color)";
			}
		}
	}
}
```
+ parametize `<function>` - Called for every attribute or css value that could be parametized.
	+ value `<string>` - The raw value.
	+ location `<string[]>` The location of the value consisting of elements in the following format:
		+ `<foo>` - Represents an svg node.
		+ `foo=` - Represents an svg node attribute name.
		+ `foo:` - Represents a css property.
		+  (css selector paths are not included for now)
	+ _this_ is the webpack loader context.
	+ return nothing to leave the value as is or a string to replace it.

Svg files can now be imported thw following way:
```js
import svg from "./my-icon.var.svg";

document.body.style.setProperty("--my-color", "red");

// svg.render() returns an SVGSVGElement instance:
document.body.append(svg.render());

// svg.markup is the transformed svg markup.
someElement.innerHTML = svg.markup;
```

## TypeScript support
To enable typescript support, reference the included type declarations:
```ts
/// <reference types="@netatwork/var-svg-loader/types.d.ts" />

import svg from "./my-icon.var.svg";
```

<br>



## Development
```shell
npm ci

# Run tests:
npm test

# Run tests and watch for changes:
npm start
```
