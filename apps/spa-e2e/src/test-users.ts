import { test } from '@playwright/test';

export const testUsernames = ['testuser'] as const;
export type TestUsernames = (typeof testUsernames)[number];

export function getAuthStoragePath(username: TestUsernames): string {
	return `playwright/.auth/${username}.json`;
}

export function asUser(username: TestUsernames): void {
	test.use({ storageState: getAuthStoragePath(username) });
}
