import { config as configEnv } from 'dotenv';
import * as path from 'path';

export type testUsernames = 'testuser';

if (!process.env.CI) {
	configEnv({
		path: path.resolve(__dirname, '../../.env'),
	});
}

/*
		You should take a close look at what test user runs what test, so you do not use any user that might execute test that have side effects on your test!
 */
export const testUserPasswords: ReadonlyMap<testUsernames, string> = new Map(
	JSON.parse(process.env.TEST_USERS),
);

export function getAuthStoragePath(username: testUsernames): string {
	return `playwright/.auth/${username}.json`;
}
