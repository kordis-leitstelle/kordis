const { composePlugins, withNx } = require('@nx/webpack');
const { resolve } = require('path');

module.exports = composePlugins(withNx(), (config) => {
	config.entry['workers/nina-warnings.worker'] = resolve(
		'libs/api/warnings/src/lib/infra/worker/nina-warnings.worker.ts',
	);

	return config;
});
