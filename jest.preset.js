const nxPreset = require('@nx/jest/preset').default;

module.exports = {
	...nxPreset,
	moduleNameMapper: {
		'^.+\\.hbs$': './hbs-string.test-helper.js',
	},
};
