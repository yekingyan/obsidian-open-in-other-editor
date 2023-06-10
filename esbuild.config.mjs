import Builder from "@ophidian/build";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const manifest = require("./manifest.json");

new Builder("src/main.ts")
	.withWatch(new URL("", import.meta.url).pathname)
	.assign({ loader: { ".png": "dataurl" } })
	.withSass()
	.withInstall(manifest.id)
	.build();
