import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { Role } from '@kordis/shared/auth';

import { User } from '../entity/user.entity';
import { UserDeactivatedEvent } from '../event/user-deactivated.event';
import { USER_SERVICE, UserService } from '../service/user.service';
import {
	DeactivateUserCommand,
	DeactivateUserHandler,
} from './deactivate-user.command';

describe('DeactivateUserHandler', () => {
	let deactivateUserHandler: DeactivateUserHandler;

	const mockUserService = createMock<UserService>();
	const mockEventBus = createMock<EventBus>();

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				DeactivateUserHandler,
				{ provide: USER_SERVICE, useValue: mockUserService },
				{ provide: EventBus, useValue: mockEventBus },
			],
		}).compile();

		deactivateUserHandler = moduleRef.get<DeactivateUserHandler>(
			DeactivateUserHandler,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const userId = 'user-id';
	const requestUserOrgId = 'request-user-org-id';

	it('should call deactivateUser and return deactivated user', async () => {
		const mockUser: User = {
			id: 'user-id',
			userName: 'userName',
			email: 'email',
			role: Role.USER,
			organizationId: 'organizationId',
			firstName: 'firstName',
			lastName: 'lastName',
			deactivated: true,
		};
		mockUserService.assertOrgMembership.mockResolvedValueOnce();
		mockUserService.deactivateUser.mockResolvedValueOnce();
		mockUserService.getUser.mockResolvedValueOnce(mockUser);

		const command = new DeactivateUserCommand(userId, requestUserOrgId);

		const result = await deactivateUserHandler.execute(command);
		expect(mockUserService.assertOrgMembership).toHaveBeenCalledWith(
			requestUserOrgId,
			userId,
		);
		expect(mockUserService.deactivateUser).toHaveBeenCalledWith(userId);
		expect(mockEventBus.publish).toHaveBeenCalledWith(
			new UserDeactivatedEvent(userId),
		);
		expect(result).toEqual(mockUser);
	});

	it('should throw an error if isAllowedToModifyOrThrow throws an exception', async () => {
		const error = new Error('not allowed');
		mockUserService.assertOrgMembership.mockRejectedValueOnce(error);

		const command = new DeactivateUserCommand(userId, requestUserOrgId);

		await expect(deactivateUserHandler.execute(command)).rejects.toThrow(error);

		expect(mockUserService.assertOrgMembership).toHaveBeenCalledWith(
			requestUserOrgId,
			userId,
		);
		expect(mockUserService.deactivateUser).not.toHaveBeenCalled();
	});
});
