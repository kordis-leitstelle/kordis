import { createMock } from '@golevelup/ts-jest';

import { KordisRequest } from '@kordis/api/shared';

import { VerifyAuthUserStrategy } from './verify-auth-user.strategy';
import { VerifyDevBearerStrategy } from './verify-dev-bearer.strategy';

describe('VerifyDevBearerStrategy', () => {
	let extractStrat: VerifyAuthUserStrategy;

	beforeEach(() => {
		extractStrat = new VerifyDevBearerStrategy();
	});

	it('should return null if the authorization header is not present', async () => {
		const req = createMock<Omit<KordisRequest, 'user'>>({
			headers: {},
		});

		await expect(extractStrat.verifyUserFromRequest(req)).resolves.toBeNull();
	});

	it('should extract user correctly from signed access token', async () => {
		const headerValue =
			'Bearer eyJhbGciOiJIUzI1NiJ9.eyJvaWQiOiJjMGNjNDQwNC03OTA3LTQ0ODAtODZkMy1iYTRiZmM1MTNjNmQiLCJzdWIiOiJjMGNjNDQwNC03OTA3LTQ0ODAtODZkMy1iYTRiZmM1MTNjNmQiLCJnaXZlbl9uYW1lIjoiVGVzdCIsImZhbWlseV9uYW1lIjoiVXNlciIsImVtYWlscyI6WyJ0ZXN0QHRpbW9ubWFzYmVyZy5jb20iXX0.9FXjgT037QkeE0KptQo3MzMriuXGzqCNfBDVEkWbJaA';

		const req = createMock<Omit<KordisRequest, 'user'>>({
			headers: { authorization: headerValue },
		});

		await expect(extractStrat.verifyUserFromRequest(req)).resolves.toEqual({
			id: 'c0cc4404-7907-4480-86d3-ba4bfc513c6d',
			email: 'test@timonmasberg.com',
			firstName: 'Test',
			lastName: 'User',
		});
	});
});
