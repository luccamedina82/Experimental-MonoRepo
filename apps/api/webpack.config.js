const nodeExternals = require(
  require.resolve('webpack-node-externals', {
    paths: [require.resolve('@nestjs/cli/package.json')],
  }),
);

/** @param {import('webpack').Configuration} options */
module.exports = function (options) {
  // Override externals: use allowlist so @repo/* workspace packages get bundled.
  options.externals = [
    nodeExternals({
      allowlist: [/^@repo\//],
    }),
  ];

  // Allow ts-loader to process @repo/* packages inside node_modules
  if (options.module && options.module.rules) {
    options.module.rules = options.module.rules.map((rule) => {
      if (rule.test && rule.test.toString().includes('tsx?')) {
        return {
          ...rule,
          exclude: /node_modules\/(?!@repo)/,
        };
      }
      return rule;
    });
  }

  return options;
};
