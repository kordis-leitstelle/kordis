import { createMock } from '@golevelup/ts-jest';

import type { KordisRequest } from '@kordis/api/shared';

import type { AuthUserExtractorStrategy } from './auth-user-extractor.strategy';
import { ExtractUserFromMsPrincipleHeader } from './auth-user-extractor.strategy';

describe('ExtractUserFromMsPrincipleHeader', () => {
	let extractStrat: AuthUserExtractorStrategy;

	beforeEach(() => {
		extractStrat = new ExtractUserFromMsPrincipleHeader();
	});

	it('should return null if the authorization header is not present', () => {
		const req = createMock<Omit<KordisRequest, 'user'>>({
			headers: {},
		});
		const result = extractStrat.getUserFromRequest(req);

		expect(result).toBeNull();
	});

	it('should extract user correctly from signed access token', () => {
		const headerValue =
			'Bearer eyJhbGciOiJIUzI1NiJ9.eyJvaWQiOiJjMGNjNDQwNC03OTA3LTQ0ODAtODZkMy1iYTRiZmM1MTNjNmQiLCJzdWIiOiJjMGNjNDQwNC03OTA3LTQ0ODAtODZkMy1iYTRiZmM1MTNjNmQiLCJnaXZlbl9uYW1lIjoiVGVzdCIsImZhbWlseV9uYW1lIjoiVXNlciIsImVtYWlscyI6WyJ0ZXN0QHRpbW9ubWFzYmVyZy5jb20iXX0.9FXjgT037QkeE0KptQo3MzMriuXGzqCNfBDVEkWbJaA';

		const req = createMock<Omit<KordisRequest, 'user'>>({
			headers: { authorization: headerValue },
		});

		expect(extractStrat.getUserFromRequest(req)).toEqual({
			id: 'c0cc4404-7907-4480-86d3-ba4bfc513c6d',
			email: 'test@timonmasberg.com',
			firstName: 'Test',
			lastName: 'User',
		});
	});
});
