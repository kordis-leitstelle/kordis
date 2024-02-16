import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { Role } from '@kordis/shared/auth';

import { UserEntity } from '../entity/user.entity';
import { USER_SERVICE, UserService } from '../service/user.service';
import { UpdateRoleCommand, UpdateRoleHandler } from './update-role.command';

describe('UpdateRoleHandler', () => {
	let changeRoleHandler: UpdateRoleHandler;

	const mockUserService = createMock<UserService>();

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				UpdateRoleHandler,
				{ provide: USER_SERVICE, useValue: mockUserService },
			],
		}).compile();

		changeRoleHandler = moduleRef.get<UpdateRoleHandler>(UpdateRoleHandler);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call changeRole and return modified user', async () => {
		mockUserService.getUser.mockResolvedValueOnce({
			id: 'userId',
			role: Role.ADMIN,
		} as UserEntity);
		const command = new UpdateRoleCommand(
			'userId',
			Role.ADMIN,
			'requestUserOrgId',
		);

		await changeRoleHandler.execute(command);

		expect(mockUserService.updateRole).toHaveBeenCalledWith(
			'requestUserOrgId',
			'userId',
			Role.ADMIN,
		);
	});
});
