import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

import { baseConfig } from '../../playwright.config.base';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:4200/';

const config: PlaywrightTestConfig = {
	...baseConfig,
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
	},
};

export default config;
