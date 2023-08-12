const { composePlugins, withNx } = require('@nx/webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { resolve } = require('path');

module.exports = composePlugins(withNx(), (config) => {
	config.plugins.push(
		new CopyPlugin({
			patterns: [{ from: 'src/.env', to: '.', noErrorOnMissing: true }],
		}),
	);

	config.entry['workers/hpa-ship-position.worker'] = resolve(
		'libs/api/ship-positions/src/lib/infra/provider/hpa/worker/hpa-ship-position.worker.ts',
	);
	return config;
});
