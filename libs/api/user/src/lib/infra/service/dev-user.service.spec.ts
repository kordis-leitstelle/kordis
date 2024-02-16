import { Role } from '@kordis/shared/model';

import { DevUserService } from './dev-user.service';

describe('DevUserService', () => {
	let devUserService: DevUserService;

	beforeEach(() => {
		devUserService = new DevUserService();
	});

	it('should create a new user', async () => {
		const firstName = 'John';
		const lastName = 'Doe';
		const userName = 'johndoe';
		const email = 'john.doe@example.com';
		const role = Role.USER;
		const organizationId = '123';

		const createdUser = await devUserService.createUser(
			firstName,
			lastName,
			userName,
			email,
			role,
			organizationId,
		);

		expect(createdUser.firstName).toBe(firstName);
		expect(createdUser.lastName).toBe(lastName);
		expect(createdUser.userName).toBe(userName);
		expect(createdUser.email).toBe(email);
		expect(createdUser.role).toBe(role);
		expect(createdUser.organizationId).toBe(organizationId);
	});

	it('should return users belonging to the specified organization', async () => {
		const orgId = '123';

		const firstName = 'John';
		const lastName = 'Doe';
		const userName = 'johndoe';
		const email = 'john.doe@example.com';
		const role = Role.USER;
		const organizationId = '123';

		await devUserService.createUser(
			firstName,
			lastName,
			userName,
			email,
			role,
			organizationId,
		);
		await devUserService.createUser(
			firstName,
			lastName,
			userName,
			email,
			role,
			'random org id',
		);

		const organizationUsers = await devUserService.getOrganizationUsers(orgId);

		expect(organizationUsers).toHaveLength(1);
		expect(organizationUsers[0].firstName).toBe(firstName);
		expect(organizationUsers[0].lastName).toBe(lastName);
		expect(organizationUsers[0].userName).toBe(userName);
		expect(organizationUsers[0].email).toBe(email);
		expect(organizationUsers[0].role).toBe(role);
		expect(organizationUsers[0].organizationId).toBe(organizationId);
	});

	it('should return empty array for login history', async () => {
		await expect(devUserService.getLoginHistory()).resolves.toEqual([]);
	});

	it('should change mail', async () => {
		const { id } = await devUserService.createUser(
			'John',
			'Doe',
			'johndoe',
			'test@mail.com',
			Role.USER,
			'123',
		);
		await devUserService.updateEmail('123', id, 'new@mail.com');
		await expect(devUserService.getUser('123', id)).resolves.toEqual(
			expect.objectContaining({ email: 'new@mail.com' }),
		);
	});

	it('should change role', async () => {
		const { id } = await devUserService.createUser(
			'John',
			'Doe',
			'johndoe',
			'test@mail.com',
			Role.USER,
			'123',
		);
		await devUserService.updateRole('123', id, Role.ADMIN);
		await expect(devUserService.getUser('123', id)).resolves.toEqual(
			expect.objectContaining({ role: Role.ADMIN }),
		);
	});

	it('should deactivate and reactivate user', async () => {
		const { id } = await devUserService.createUser(
			'John',
			'Doe',
			'johndoe',
			'test@mail.com',
			Role.USER,
			'123',
		);
		await devUserService.deactivateUser('123', id);
		await expect(devUserService.getUser('123', id)).resolves.toEqual(
			expect.objectContaining({ deactivated: true }),
		);

		await devUserService.reactivateUser('123', id);
		await expect(devUserService.getUser('123', id)).resolves.toEqual(
			expect.objectContaining({ deactivated: false }),
		);
	});
});
