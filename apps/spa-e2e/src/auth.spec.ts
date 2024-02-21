import { expect, test } from '@playwright/test';

import { asUser } from './test-users';

test('should get redirected to auth as unauthenticated', async ({ page }) => {
	await page.goto('/');
	await page.waitForURL('/auth');

	await expect(page).toHaveURL('/auth');
});

test.describe('as authenticated', () => {
	asUser('testuser');

	test('should get initially redirected to /dashboard', async ({ page }) => {
		await page.goto('/');
		await page.waitForURL('/dashboard');
		await expect(page).toHaveURL('/dashboard');
	});
});
