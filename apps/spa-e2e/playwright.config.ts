import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:4200/';

const config: PlaywrightTestConfig = {
	...nxE2EPreset(__filename, { testDir: './src' }),
	projects: [
		{ name: 'setup', testMatch: /.*\.setup\.ts/ },
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
			},
			dependencies: ['setup'],
		},
	],
	use: {
		baseURL,
		screenshot: 'only-on-failure',
		video: 'retry-with-video',
		trace: 'on-first-retry',
	},
};

export default config;
