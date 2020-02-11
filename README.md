# @netatwork/var-svg-loader
A webpack loader for parametizing svgs at build time.

![example image](example.png)

As almost all graphic software does not support css variables when exporting svgs, this loader can be used to replace specific colors with css variables at build time. For instance, an icon color can be changed by a theme without maintaining different versions of the same icon:
```xml
<?xml version="1.0" encoding="utf-8" ?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <style>
        .bg { fill: #506070; }
    </style>
    <rect class="bg" width="64" height="64" />
    <circle cx="0" cy="48" r="48" fill="#D0D3D6" />
    <rect width="64" height="16" x="0" y="0" style="fill: #00AFFF" />
</svg>
```
can be transformed into:
```xml
<svg viewBox="0 0 64 64">
    <style>
        .bg { fill: var(--bg) }
    </style>
    <rect class="bg" width="64" height="64" />
    <circle cx="0" cy="48" r="48" fill="var(--color1)" />
    <rect width="64" height="16" x="0" y="0" style="fill: var(--color2)" />
</svg>
```

<br>



# Configuration
```shell
npm i -D @netatwork/var-svg-loader
```
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

## Helpers
The following helper functions can be used to assemble
a parametize function that fit your needs

### `colors`
Parametize colors by replacing the svg `stroke` and `fill` attribute values with css variables:
```js
import { colors } from "@netatwork/var-svg-loader";

parametize: colors({
	prefix: "--example-icon-",
	colors: {
		colorA: "#ff0000",
		colorB: "rgb(0, 127, 255)",
		...
	}
})
```
```xml
<svg>
	<rect fill="#ff0000" ... />
	<path stroke="#007fff" ... />
</svg>
<!-- is transformed to -->
<svg>
	<rect fill="var(--example-icon-colorA)" ... />
	<path stroke="var(--example-icon-colorB)" ... />
</svg>
```

### `oneOf`
Use the first of the specified functions that returns a value.
```js
import { oneOf } from "@netatwork/var-svg-loader";

parametize: oneOf(
	parametizeColors({ ... }),
	parametizeColors(require("some-package/some-config.json"))
)
```



<br>

# Usage

## Imports
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
/// <reference types="@netatwork/var-svg-loader/runtime" />

import svg from "./my-icon.var.svg";
```

Or import the VarSvg interface:
```ts
import { VarSvg } from "@netatwork/var-svg-loader/runtime" />

import svg from "./my-icon.var.svg";

const myIcon: VarSvg = svg;
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
