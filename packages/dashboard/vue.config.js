const { defineConfig } = require("@vue/cli-service");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    resolve: {
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        path: require.resolve("path-browserify"),
        stream: require.resolve("stream-browserify"),
      },
    },
    plugins: [new NodePolyfillPlugin()],
  },
});
