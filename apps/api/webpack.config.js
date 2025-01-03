const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
	config.module.rules.push({
		test: /\.hbs$/,
		type: 'asset/source',
	});
	return config;
});
