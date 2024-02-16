import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { Role } from '@kordis/shared/model';

import { UserEntity } from '../entity/user.entity';
import { BaseUserService, USER_SERVICE } from '../service/user.service';
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
		const mockUser: UserEntity = {
			id: 'userId',
			userName: 'userName',
			email: 'email',
			role: Role.USER,
			organizationId: 'organizationId',
			firstName: 'firstName',
			lastName: 'lastName',
			deactivated: false,
		};

		mockUserService.reactivateUser.mockResolvedValueOnce();
		mockUserService.getUser.mockResolvedValueOnce(mockUser);

		const command = new ReactivateUserCommand('userId', 'requestUserOrgId');

		await reactivateUserHandler.execute(command);
		expect(mockUserService.reactivateUser).toHaveBeenCalledWith(
			'requestUserOrgId',
			'userId',
		);
	});
});
