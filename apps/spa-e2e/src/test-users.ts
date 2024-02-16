import { test } from '@playwright/test';

import { TEST_USERS } from '@kordis/shared/test-helpers';

export type TestUsernames = (typeof TEST_USERS)[number]['userName'];

export function getAuthStoragePath(username: TestUsernames): string {
	return `playwright/.auth/${username}.json`;
}

/*
 * Use this function to set the session to a given test user. Each testuser has different claims. You should carefully choose the testuser for your test, to avoid weird states in parallel running tests.
 * @see libs/shared/test-helpers/src/lib/test-users.test-helper.ts
 * @see apps/api/dev-tokens.md
 * @param username The username of the testuser
 * */
export function asUser(username: TestUsernames): void {
	test.use({ storageState: getAuthStoragePath(username) });
}
