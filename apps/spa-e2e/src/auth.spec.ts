import { expect, test } from '@playwright/test';

import { LoginPo } from './page-objects/login.po';
import { getAuthStoragePath, testUserPasswords } from './test-users';

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
	await loginPo.login('testuser', testUserPasswords.get('testuser'));

	await page.waitForURL('/protected');
	await expect(page).toHaveURL('/protected');
});

test.describe('as authenticated', () => {
	test.use({ storageState: getAuthStoragePath('testuser') });

	test('should get initially redirected to /protected', async ({ page }) => {
		await page.goto('/');
		await page.waitForURL('/protected');
		await expect(page).toHaveURL('/protected');
	});
});
