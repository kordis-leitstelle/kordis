import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { Role } from '@kordis/shared/auth';

import { USER_SERVICE, UserService } from '../service/user.service';
import {
	OrganizationUsersHandler,
	OrganizationUsersQuery,
} from './organization-users.query';

describe('OrganizationUsersHandler', () => {
	let organizationUsersHandler: OrganizationUsersHandler;

	const mockUserService = createMock<UserService>();

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				OrganizationUsersHandler,
				{ provide: USER_SERVICE, useValue: mockUserService },
			],
		}).compile();

		organizationUsersHandler = moduleRef.get<OrganizationUsersHandler>(
			OrganizationUsersHandler,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call getOrganizationUsers and return users', async () => {
		const users = [
			{
				id: 'user-id-1',
				lastName: 'Doe',
				firstName: 'John',
				userName: 'johndoe',
				role: Role.USER,
				organizationId: 'org-id-1',
				email: 'test@mail.com',
				deactivated: false,
			},
		];
		mockUserService.getOrganizationUsers.mockResolvedValueOnce(users);
		const getOrgUsersSpy = jest.spyOn(mockUserService, 'getOrganizationUsers');
		await expect(
			organizationUsersHandler.execute(new OrganizationUsersQuery('org-id-1')),
		).resolves.toEqual(users);
		expect(getOrgUsersSpy).toHaveBeenCalledWith('org-id-1');
	});
});
