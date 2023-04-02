import { test as setup } from '@playwright/test';

import { LoginPo } from './page-objects/login.po';
import { getAuthStoragePath, testUserPasswords } from './test-users';

// Documentation: https://playwright.dev/docs/auth#multiple-signed-in-roles

setup('authenticate as testusers', async ({ browser }) => {
	for (const [username, password] of testUserPasswords.entries()) {
		const context = await browser.newContext();
		const page = await context.newPage();
		await new LoginPo(page).login(username, password);
		await page.waitForURL('/protected');

		await context.storageState({ path: getAuthStoragePath(username) });
		await context.close();
	}
});
