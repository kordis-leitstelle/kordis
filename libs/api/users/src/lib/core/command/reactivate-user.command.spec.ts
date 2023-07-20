import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { Role } from '@kordis/shared/auth';

import { User } from '../entity/user.entity';
import { InsufficientPermissionException } from '../exception/insufficient-permission.exception';
import { BaseUserService, USER_SERVICE } from '../service/user.service';
import { DeactivateUserCommand } from './deactivate-user.command';
import {
	ReactivateUserCommand,
	ReactivateUserHandler,
} from './reactivate-user.command';

describe('ReactivateUserHandler', () => {
	let reactivateUserHandler: ReactivateUserHandler;

	const mockUserService = createMock<BaseUserService>();

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				ReactivateUserHandler,
				{ provide: USER_SERVICE, useValue: mockUserService },
			],
		}).compile();

		reactivateUserHandler = moduleRef.get<ReactivateUserHandler>(
			ReactivateUserHandler,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call reactivateUser and return reactivated user', async () => {
		const mockUser: User = {
			id: 'userId',
			userName: 'userName',
			email: 'email',
			role: Role.USER,
			organizationId: 'organizationId',
			firstName: 'firstName',
			lastName: 'lastName',
			deactivated: false,
		};
		mockUserService.assertOrgMembership.mockResolvedValueOnce();
		mockUserService.reactivateUser.mockResolvedValueOnce();
		mockUserService.getUser.mockResolvedValueOnce(mockUser);

		const command = new ReactivateUserCommand('userId', 'requestUserOrgId');

		const result = await reactivateUserHandler.execute(command);
		expect(mockUserService.reactivateUser).toHaveBeenCalledWith('userId');
		expect(result).toEqual(mockUser);
	});

	it('should throw Error if assertOrgAdminTaskOrOwnUser fails', async () => {
		const command = new DeactivateUserCommand('userId', 'requestUserOrgId');
		mockUserService.assertOrgMembership.mockRejectedValueOnce(
			new InsufficientPermissionException(),
		);
		await expect(reactivateUserHandler.execute(command)).rejects.toThrow(
			InsufficientPermissionException,
		);
		expect(mockUserService.reactivateUser).not.toHaveBeenCalled();
	});
});
