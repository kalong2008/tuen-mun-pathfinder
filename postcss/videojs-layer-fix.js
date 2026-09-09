/** @type {import('postcss').PluginCreator<void>} */
const videojsLayerFix = () => ({
  postcssPlugin: "videojs-layer-fix",
  Once(root, { result }) {
    if (!result.opts.from?.includes("@videojs/react")) {
      return;
    }

    root.walkAtRules("layer", (rule) => {
      const params = rule.params.trim();

      if (params === "base" || params.startsWith("base.")) {
        rule.params = params.replace(/^base/, "videojs-base");
        return;
      }

      if (params === "components") {
        rule.params = "videojs-components";
        return;
      }

      if (params === "utilities") {
        rule.params = "videojs-utilities";
      }
    });
  },
});
videojsLayerFix.postcss = true;

module.exports = videojsLayerFix;
