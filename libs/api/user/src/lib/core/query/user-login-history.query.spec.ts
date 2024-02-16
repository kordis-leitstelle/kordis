import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { USER_SERVICE, UserService } from '../service/user.service';
import {
	UserLoginHistoryHandler,
	UserLoginHistoryQuery,
} from './user-login-history.query';

describe('UserLoginHistoryHandler', () => {
	let userLoginHistoryHandler: UserLoginHistoryHandler;

	const mockUserService = createMock<UserService>();

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				UserLoginHistoryHandler,
				{ provide: USER_SERVICE, useValue: mockUserService },
			],
		}).compile();

		userLoginHistoryHandler = moduleRef.get<UserLoginHistoryHandler>(
			UserLoginHistoryHandler,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call getLoginHistory and return timestamps', async () => {
		const loginHistory = [
			new Date('1689756688000'),
			new Date('1689725870000'),
			new Date('1689720476000'),
		];
		mockUserService.getLoginHistory.mockResolvedValueOnce(loginHistory);
		const getLoginHistory = jest.spyOn(mockUserService, 'getLoginHistory');
		await expect(
			userLoginHistoryHandler.execute(
				new UserLoginHistoryQuery('user-id', 3, 'requestOrgId'),
			),
		).resolves.toEqual(loginHistory);
		expect(getLoginHistory).toHaveBeenCalledWith('requestOrgId', 'user-id', 3);
	});
});
