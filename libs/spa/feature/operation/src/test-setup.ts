import 'jest-preset-angular/setup-jest';


// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
	testEnvironmentOptions: {
		errorOnUnknownElements: true,
		errorOnUnknownProperties: true,
	},
};

// workaround for current css parser issue with @layer https://github.com/thymikee/jest-preset-angular/issues/2194
let consoleSpy: jest.SpyInstance;
beforeAll(() => {
	consoleSpy = jest
		.spyOn(global.console, 'error')
		.mockImplementation((message) => {
			if (!message?.message?.includes('Could not parse CSS stylesheet')) {
				global.console.warn(message);
			}
		});
});

afterAll(() => consoleSpy.mockRestore());
