import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { Role } from '@kordis/shared/auth';

import { User } from '../entity/user.entity';
import { UserNotFoundException } from '../exception/user-not-found.exception';
import { USER_SERVICE, UserService } from '../service/user.service';
import { ChangeRoleCommand, ChangeRoleHandler } from './change-role.command';

describe('ChangeRoleHandler', () => {
	let changeRoleHandler: ChangeRoleHandler;

	const mockUserService = createMock<UserService>();

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				ChangeRoleHandler,
				{ provide: USER_SERVICE, useValue: mockUserService },
			],
		}).compile();

		changeRoleHandler = moduleRef.get<ChangeRoleHandler>(ChangeRoleHandler);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call changeRole and return modified user', async () => {
		mockUserService.assertOrgMembership.mockResolvedValueOnce(undefined);

		mockUserService.getUser.mockResolvedValueOnce({
			id: 'userId',
			role: Role.ADMIN,
		} as User);
		const command = new ChangeRoleCommand(
			'userId',
			Role.ADMIN,
			'requestUserOrgId',
		);

		const result = await changeRoleHandler.execute(command);

		expect(mockUserService.changeRole).toHaveBeenCalledWith(
			'userId',
			Role.ADMIN,
		);
		expect(mockUserService.getUser).toHaveBeenCalledWith('userId');
		expect(result).toEqual({ id: 'userId', role: Role.ADMIN });
	});

	it('should throw UserNotFoundException if admin modifies user in different org', async () => {
		mockUserService.assertOrgMembership.mockRejectedValueOnce(
			new UserNotFoundException(),
		);

		const command = new ChangeRoleCommand(
			'userId',
			Role.ADMIN,
			'requestUserOrgId',
		);

		await expect(changeRoleHandler.execute(command)).rejects.toThrow(
			UserNotFoundException,
		);

		expect(mockUserService.assertOrgMembership).toHaveBeenCalledWith(
			'requestUserOrgId',
			'userId',
		);
		expect(mockUserService.changeRole).not.toHaveBeenCalled();
	});
});
