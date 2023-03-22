import { expect, test } from '@playwright/test';

import { testuserState } from './auth.setup';
import { LoginPo } from './page-objects/login.po';

test('should get redirected to auth as unauthenticated', async ({ page }) => {
	await page.goto('/');
	await page.waitForURL('/auth');

	await expect(page).toHaveURL('/auth');
});

test('should not be able to access /protected as unauthenticated', async ({
	page,
}) => {
	await page.goto('/protected');
	await page.waitForURL('/auth');

	await expect(page).toHaveURL('/auth');
});

test('should be able to login with redirect to /protected', async ({
	page,
}) => {
	const loginPo = new LoginPo(page);

	await loginPo.login('testuser', 'testuser1234');

	await page.waitForURL('/protected');
	await expect(page).toHaveURL('/protected');
});

test.describe('as authenticated', () => {
	test.use({ storageState: testuserState });

	test('should get initially redirected to /protected', async ({ page }) => {
		await page.goto('/');
		await page.waitForURL('/protected');
		await expect(page).toHaveURL('/protected');
	});
});
