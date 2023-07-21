import { Role } from '@kordis/shared/auth';

import { UserNotFoundException } from '../../core/exception/user-not-found.exception';
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

	it('should throw an error if the user or organization is not found', async () => {
		jest.spyOn(devUserService, 'getUser').mockResolvedValueOnce(null);
		await expect(
			devUserService.assertOrgMembership('organizationId', 'userId'),
		).rejects.toThrow(UserNotFoundException);
	});

	it('should not throw an error if the request user is allowed to modify the user', async () => {
		const { id } = await devUserService.createUser(
			'John',
			'Doe',
			'johndoe',
			'john.doe@example.com',
			Role.USER,
			'organizationId',
		);

		await expect(
			devUserService.assertOrgMembership('organizationId', id),
		).resolves.not.toThrow();
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
		await devUserService.changeEmail(id, 'new@mail.com');
		await expect(devUserService.getUser(id)).resolves.toEqual(
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
		await devUserService.changeRole(id, Role.ADMIN);
		await expect(devUserService.getUser(id)).resolves.toEqual(
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
		await devUserService.deactivateUser(id);
		await expect(devUserService.getUser(id)).resolves.toEqual(
			expect.objectContaining({ deactivated: true }),
		);

		await devUserService.reactivateUser(id);
		await expect(devUserService.getUser(id)).resolves.toEqual(
			expect.objectContaining({ deactivated: false }),
		);
	});
});
