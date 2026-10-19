import path from "node:path";
import { fileURLToPath } from "node:url";

const videojsLayerFix = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "postcss/videojs-layer-fix.js",
);

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    [videojsLayerFix]: {},
    tailwindcss: {},
  },
};

export default config;
