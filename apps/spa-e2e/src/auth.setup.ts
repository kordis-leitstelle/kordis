import { test as setup } from '@playwright/test';

import { LoginPo } from './page-objects/login.po';
import { TestUsernames, getAuthStoragePath, testUsernames } from './test-users';

// Documentation: https://playwright.dev/docs/auth#multiple-signed-in-roles

setup('authenticate as testusers', async ({ browser }) => {
	/**
	 * 	If Active Directory B2C Users are set, we use them (e.g. in Next Deployment E2Es),
	 * 	otherwise we fall back to our preset users for the DevAuthModule that have the same claims and usernames.
	 */
	if (process.env.AADB2C_TEST_USERS) {
		const testUserPasswords: ReadonlyMap<TestUsernames, string> = new Map(
			JSON.parse(process.env.AADB2C_TEST_USERS),
		);

		for (const [username, password] of testUserPasswords.entries()) {
			const context = await browser.newContext();
			const page = await context.newPage();
			await new LoginPo(page).loginWithB2C(username, password);
			await page.waitForURL('/protected');

			await context.storageState({ path: getAuthStoragePath(username) });
			await context.close();
		}
	} else {
		for (const username of testUsernames) {
			const context = await browser.newContext();
			const page = await context.newPage();
			await new LoginPo(page).loginViaDevAuth(username);
			await page.waitForURL('/protected');

			await context.storageState({ path: getAuthStoragePath(username) });
			await context.close();
		}
	}
});
