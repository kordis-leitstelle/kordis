import { TEST_USERS } from '@kordis/shared/test-helpers';

export const getUserByUsername = <
	UsernameType extends (typeof TEST_USERS)[number]['userName'],
>(
	username: UsernameType,
) =>
	TEST_USERS.find((user) => user.userName === username) as Extract<
		(typeof TEST_USERS)[number],
		Record<'userName', UsernameType>
	>;
