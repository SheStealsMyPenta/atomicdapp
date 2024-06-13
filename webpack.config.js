const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
    // Other rules...
    plugins: [
        new NodePolyfillPlugin()
    ]
}
module.exports = {
  resolve: {
    fallback: {
      "stream": require.resolve("stream-browserify")
    }
  }
};