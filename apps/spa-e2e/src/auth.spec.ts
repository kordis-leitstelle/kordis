import { expect, test } from '@playwright/test';

import { asUser } from './test-users';

test('should get redirected to auth as unauthenticated', async ({ page }) => {
	await page.goto('/');
	await page.waitForURL('/auth');

	await expect(page).toHaveURL('/auth');
});

test.describe('as authenticated', () => {
	asUser('testuser');

	test('should get initially redirected to /protected', async ({ page }) => {
		await page.goto('/');
		await page.waitForURL('/protected');
		await expect(page).toHaveURL('/protected');
	});
});
