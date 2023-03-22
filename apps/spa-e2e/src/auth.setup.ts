import { test as setup } from '@playwright/test';

import { LoginPo } from './page-objects/login.po';

/*
		Here we can add our test users to test for different roles and organizations.
		You should take a close look at what testuser runs what test, so you do not use any user that might execute test that have side effects on your test!
		Documentation: https://playwright.dev/docs/auth#multiple-signed-in-roles
 */

export const testuserState = 'playwright/.auth/testuser.json';

setup('authenticate as testuser', async ({ page }) => {
	await new LoginPo(page).login('testuser', 'testuser1234');

	await page.context().storageState({ path: testuserState });
});
