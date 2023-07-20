import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { Role } from '@kordis/shared/auth';

import { User } from '../entity/user.entity';
import { InsufficientPermissionException } from '../exception/insufficient-permission.exception';
import { UserNotFoundException } from '../exception/user-not-found.exception';
import { USER_SERVICE, UserService } from '../service/user.service';
import { ChangeEmailCommand, ChangeEmailHandler } from './change-email.command';

describe('ChangeEmailHandler', () => {
	let changeEmailHandler: ChangeEmailHandler;
	let mockUserService: DeepMocked<UserService>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				ChangeEmailHandler,
				{ provide: USER_SERVICE, useValue: createMock<UserService>() },
			],
		}).compile();

		changeEmailHandler = moduleRef.get<ChangeEmailHandler>(ChangeEmailHandler);
		mockUserService = moduleRef.get<DeepMocked<UserService>>(USER_SERVICE);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call changeEmail and return modified user', async () => {
		mockUserService.assertOrgMembership.mockResolvedValueOnce(undefined);

		mockUserService.getUser.mockResolvedValueOnce({
			id: 'userId',
			email: 'test@mail.com',
		} as User);

		const command = new ChangeEmailCommand(
			'userId',
			'test@mail.com',
			'userId',
			Role.USER,
			'requestUserOrgId',
		);

		const result = await changeEmailHandler.execute(command);

		expect(mockUserService.changeEmail).toHaveBeenCalledWith(
			'userId',
			'test@mail.com',
		);
		expect(mockUserService.getUser).toHaveBeenCalledWith('userId');
		expect(result).toEqual({ id: 'userId', email: 'test@mail.com' });
	});

	it('should throw UserNotFoundException if admin modifies user in different org', async () => {
		mockUserService.assertOrgMembership.mockRejectedValueOnce(
			new UserNotFoundException(),
		);

		const command = new ChangeEmailCommand(
			'userId',
			'test@mail.de',
			'differentUserId',
			Role.ORGANIZATION_ADMIN,
			'requestUserOrgId',
		);

		await expect(changeEmailHandler.execute(command)).rejects.toThrow(
			UserNotFoundException,
		);

		expect(mockUserService.assertOrgMembership).toHaveBeenCalledWith(
			'requestUserOrgId',
			'userId',
		);
		expect(mockUserService.changeEmail).not.toHaveBeenCalled();
	});

	it('should throw InsufficientPermissionException if user modifies different user', async () => {
		const command = new ChangeEmailCommand(
			'userId',
			'test@mail.com',
			'differentUserId',
			Role.USER,
			'requestUserOrgId',
		);

		await expect(changeEmailHandler.execute(command)).rejects.toThrow(
			InsufficientPermissionException,
		);

		expect(mockUserService.changeEmail).not.toHaveBeenCalled();
	});
});
