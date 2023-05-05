const { composePlugins, withNx } = require('@nx/webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = composePlugins(withNx(), (config) => {
	config.plugins.push(
		new CopyPlugin({
			patterns: [{ from: 'src/.env', to: '.', noErrorOnMissing: true }],
		}),
	);

	return config;
});
