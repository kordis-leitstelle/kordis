/* eslint-disable */
export default {
	displayName: 'api-operation',
	preset: '../../../jest.preset.js',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../../../coverage/libs/api/operation',
	moduleNameMapper: {
		'\\.hbs$': '<rootDir>/operation-hbs.module.test-helper.js',
	},
};
