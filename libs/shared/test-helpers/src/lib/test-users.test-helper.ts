import { Role } from '@kordis/shared/model';

// keep in sync with the apps/api/dev-tokens.md file!
export const TEST_USERS = [
	{
		id: 'fbdd030c-bae9-4213-9e04-732b1cc8f5b8 ',
		deactivated: false,
		firstName: 'Test',
		lastName: 'User',
		userName: 'testuser',
		organizationId: 'dff7584efe2c174eee8bae45',
		email: 'testuser@kordis-leitstelle.de',
		role: Role.USER,
	},
	{
		id: 'f60157a8-3054-48e1-937c-82302526c1ed',
		deactivated: false,
		firstName: 'Test',
		lastName: 'Admin',
		userName: 'testadmin',
		organizationId: 'dff7584efe2c174eee8bae45',
		email: 'testadmin@kordis-leitstelle.de',
		role: Role.ADMIN,
	},
	{
		id: 'd8e3e5f2-fb05-4c47-b869-5a558e1f57e5',
		deactivated: false,
		firstName: 'Test',
		lastName: 'Org Admin',
		userName: 'testadmin',
		organizationId: 'dff7584efe2c174eee8bae45',
		email: 'testorgadmin@kordis-leitstelle.de',
		role: Role.ORGANIZATION_ADMIN,
	},
] as const;
