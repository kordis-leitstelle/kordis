const { composePlugins, withNx } = require('@nrwl/webpack');

module.exports = composePlugins(withNx(), (config) => {
	return config;
});
