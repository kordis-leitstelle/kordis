const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
	// import hbs templates as simple string
	config.module.rules.push({
		test: /\.hbs$/,
		type: 'asset/source',
	});
	return config;
});
