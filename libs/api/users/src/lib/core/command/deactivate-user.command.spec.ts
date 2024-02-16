import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

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

	it('should call deactivateUser', async () => {
		mockUserService.deactivateUser.mockResolvedValueOnce();

		const command = new DeactivateUserCommand(userId, requestUserOrgId);

		await deactivateUserHandler.execute(command);

		expect(mockUserService.deactivateUser).toHaveBeenCalledWith(
			userId,
			requestUserOrgId,
		);
		expect(mockEventBus.publish).toHaveBeenCalledWith(
			new UserDeactivatedEvent(userId),
		);
	});
});
