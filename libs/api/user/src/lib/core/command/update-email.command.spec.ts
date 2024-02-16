import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { UserEntity } from '../entity/user.entity';
import { USER_SERVICE, UserService } from '../service/user.service';
import { UpdateEmailCommand, UpdateEmailHandler } from './update-email.command';

describe('UpdateEmailHandler', () => {
	let changeEmailHandler: UpdateEmailHandler;
	let mockUserService: DeepMocked<UserService>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				UpdateEmailHandler,
				{ provide: USER_SERVICE, useValue: createMock<UserService>() },
			],
		}).compile();

		changeEmailHandler = moduleRef.get<UpdateEmailHandler>(UpdateEmailHandler);
		mockUserService = moduleRef.get<DeepMocked<UserService>>(USER_SERVICE);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call changeEmail and return modified user', async () => {
		mockUserService.getUser.mockResolvedValueOnce({
			id: 'userId',
			email: 'test@mail.com',
		} as UserEntity);

		const command = new UpdateEmailCommand('userId', 'test@mail.com', 'orgId');

		await changeEmailHandler.execute(command);

		expect(mockUserService.updateEmail).toHaveBeenCalledWith(
			'orgId',
			'userId',
			'test@mail.com',
		);
	});
});
