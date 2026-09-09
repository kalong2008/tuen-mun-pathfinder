/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "./postcss/videojs-layer-fix.js": {},
    tailwindcss: {},
  },
};

export default config;
