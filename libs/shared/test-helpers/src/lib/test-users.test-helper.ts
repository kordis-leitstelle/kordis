import { Role } from '@kordis/shared/auth';

// keep in sync with the apps/api/dev-tokens.md file!
export const TEST_USERS = Object.freeze([
	{
		id: 'c0cc4404-7907-4480-86d3-ba4bfc513c6d',
		deactivated: false,
		firstName: 'Test',
		lastName: 'User',
		userName: 'testuser',
		organizationId: '', // todo: add org id after org mr merge
		email: 'testuser@kordis-leitstelle.de',
		role: Role.USER,
	},
	{
		id: 'f60157a8-3054-48e1-937c-82302526c1ed',
		deactivated: false,
		firstName: 'Test',
		lastName: 'Admin',
		userName: 'testadmin',
		organizationId: '', // todo: add org id after org mr merge
		email: 'testadmin@kordis-leitstelle.de',
		role: Role.ADMIN,
	},
	{
		id: 'd8e3e5f2-fb05-4c47-b869-5a558e1f57e5',
		deactivated: false,
		firstName: 'Test',
		lastName: 'Org Admin',
		userName: 'testadmin',
		organizationId: '', // todo: add org id after org mr merge
		email: 'testorgadmin@kordis-leitstelle.de',
		role: Role.ORGANIZATION_ADMIN,
	},
]);
