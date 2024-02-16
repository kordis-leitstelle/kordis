import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { Role } from '@kordis/shared/model';

import { UserEntity } from '../entity/user.entity';
import { USER_SERVICE, UserService } from '../service/user.service';
import { CreateUserCommand, CreateUserHandler } from './create-user.command';

describe('CreateUserHandler', () => {
	let createUserHandler: CreateUserHandler;

	const mockUserService = createMock<UserService>();

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				CreateUserHandler,
				{ provide: USER_SERVICE, useValue: mockUserService },
			],
		}).compile();

		createUserHandler = moduleRef.get<CreateUserHandler>(CreateUserHandler);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const userName = 'username';
	const email = 'email';
	const firstName = 'firstName';
	const lastName = 'lastName';
	const organizationId = 'orgid';
	const role = Role.USER;

	it('should call createUser and return created user', async () => {
		const mockUser: UserEntity = {
			id: 'user-id',
			userName,
			email,
			role,
			organizationId,
			firstName,
			lastName,
			deactivated: false,
		};
		mockUserService.createUser.mockResolvedValueOnce(mockUser);

		const command = new CreateUserCommand(
			firstName,
			lastName,
			userName,
			email,
			role,
			organizationId,
		);

		const result = await createUserHandler.execute(command);

		expect(result).toEqual(mockUser);
	});
});
