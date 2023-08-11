import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import jwt from 'jsonwebtoken';

import { KordisRequest } from '@kordis/api/shared';

import { VerifyAADB2CJWTStrategy } from './verify-aadb2c-jwt.strategy';

jest.mock('jwks-rsa', () => () => {
	return {
		getKeys: jest.fn(),
		getSigningKey: jest.fn().mockResolvedValue({
			kid: 'kid',
			alg: 'alg',
			getPublicKey: jest.fn().mockReturnValue('publicKey'),
			rsaPublicKey: 'publicKey',
		}),
		getSigningKeys: jest.fn(),
	};
});

describe('VerifyAADB2CJWTStrategy', () => {
	let verifyAADB2CJWTStrategy: VerifyAADB2CJWTStrategy;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: ConfigService,
					useValue: createMock<ConfigService>({
						getOrThrow: jest
							.fn()
							.mockReturnValue('tenant')
							.mockReturnValue('policy')
							.mockReturnValue('clientId')
							.mockReturnValue('issuer'),
					}),
				},
				VerifyAADB2CJWTStrategy,
			],
		}).compile();

		verifyAADB2CJWTStrategy = module.get<VerifyAADB2CJWTStrategy>(
			VerifyAADB2CJWTStrategy,
		);
	});

	it('should verify and return user on valid JWT', async () => {
		const req = createMock<Omit<KordisRequest, 'user'>>({
			headers: {
				authorization: 'Bearer 123',
			},
		});

		jest.spyOn(jwt, 'decode').mockImplementationOnce(
			() =>
				({
					header: { kid: 'mockKid' },
					payload: {
						sub: 'id',
						given_name: 'foo',
						family_name: 'bar',
						emails: ['foo@bar.de'],
						organization: 'testorg',
					},
				} as any),
		);

		const verifySpy = jest.spyOn(jwt, 'verify').mockReturnValueOnce(undefined);
		await expect(
			verifyAADB2CJWTStrategy.verifyUserFromRequest(req),
		).resolves.toEqual({
			id: 'id',
			email: 'foo@bar.de',
			firstName: 'foo',
			lastName: 'bar',
			organization: 'testorg',
		});

		expect(verifySpy).toHaveBeenCalledWith(
			'123',
			'publicKey',
			expect.anything(),
		);
	});

	it('should return null on empty authorization header', async () => {
		const req = createMock<Omit<KordisRequest, 'user'>>({
			headers: {},
		});

		await expect(
			verifyAADB2CJWTStrategy.verifyUserFromRequest(req),
		).resolves.toBeNull();
	});

	it('should return null on invalid JWT', async () => {
		const req = createMock<Omit<KordisRequest, 'user'>>({
			headers: {
				authorization: 'Bearer 123',
			},
		});

		jest.spyOn(jwt, 'decode').mockImplementationOnce(
			() =>
				({
					header: { kid: 'mockKid' },
				} as any),
		);

		jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
			throw new Error('Invalid JWT');
		});

		await expect(
			verifyAADB2CJWTStrategy.verifyUserFromRequest(req),
		).resolves.toBeNull();
	});

	it('should return null on jwt decode fail', async () => {
		const req = createMock<Omit<KordisRequest, 'user'>>({
			headers: {
				authorization: 'Bearer 123',
			},
		});

		jest.spyOn(jwt, 'decode').mockImplementationOnce(() => null);

		await expect(
			verifyAADB2CJWTStrategy.verifyUserFromRequest(req),
		).resolves.toBeNull();
	});
});
