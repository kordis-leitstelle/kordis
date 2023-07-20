import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

import { Role } from '@kordis/shared/auth';

import { AADB2CUserService } from './aadb2c-user.service';

describe('AADB2CUserService', () => {
	let userService: AADB2CUserService;
	let httpService: DeepMocked<HttpService>;

	const tenantId = 'testtentant';
	const extensionAppId = 'testextensionappid';
	const clientId = 'clientId';
	const clientSecret = 'clientSecret';

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				{
					provide: HttpService,
					useValue: createMock<HttpService>(),
				},
				{
					provide: ConfigService,
					useValue: createMock<ConfigService>({
						getOrThrow: jest
							.fn()
							.mockReturnValueOnce(tenantId)
							.mockReturnValueOnce(extensionAppId)
							.mockReturnValueOnce(clientId)
							.mockReturnValueOnce(clientSecret),
					}),
				},
				AADB2CUserService,
			],
		}).compile();

		userService = moduleRef.get<AADB2CUserService>(AADB2CUserService);
		httpService = moduleRef.get<DeepMocked<HttpService>>(HttpService);
	});

	it('should send request to change the email', async () => {
		const userId = 'user-id';
		const email = 'test@example.com';
		httpService.get
			.mockImplementationOnce(() =>
				of({
					data: {
						access_token: 'access-token',
						expires_in: 3600,
					},
				} as AxiosResponse),
			)
			.mockImplementationOnce(() =>
				of({
					data: {
						identities: [
							{
								issuer: 'testtentant',
								issuerAssignedId: 'testusername',
								signInType: 'userName',
							},
						],
					},
				} as AxiosResponse),
			);

		httpService.patch.mockImplementationOnce(() => of({} as AxiosResponse));
		await userService.changeEmail(userId, email);

		expect(httpService.patch).toHaveBeenCalledWith(
			`https://graph.microsoft.com/v1.0/users/${userId}`,
			{
				identities: [
					{
						issuer: 'testtentant',
						issuerAssignedId: 'test@example.com',
						signInType: 'emailAddress',
					},
					{
						issuer: 'testtentant',
						issuerAssignedId: 'testusername',
						signInType: 'userName',
					},
				],
				mail: email,
			},
			{
				headers: {
					Authorization: `Bearer access-token`,
				},
			},
		);
	});

	it('should send request to change the role', async () => {
		const userId = 'user-id';
		const role = Role.ADMIN;
		httpService.get.mockImplementationOnce(() =>
			of({
				data: {
					access_token: 'access-token',
					expires_in: 3600,
				},
			} as AxiosResponse),
		);

		httpService.patch.mockImplementationOnce(() => of({} as AxiosResponse));
		await userService.changeRole(userId, role);

		expect(httpService.patch).toHaveBeenCalledWith(
			`https://graph.microsoft.com/v1.0/users/${userId}`,
			{
				[`extension_${extensionAppId}_Role`]: role,
			},
			{
				headers: {
					Authorization: `Bearer access-token`,
				},
			},
		);
	});

	it('should send a request to create a user', async () => {
		const firstName = 'John';
		const lastName = 'Doe';
		const username = 'johndoe';
		const email = 'test@example.com';
		const orgId = 'org-id';
		httpService.get.mockImplementationOnce(() =>
			of({
				data: {
					access_token: 'access-token',
				},
			} as AxiosResponse),
		);
		httpService.post.mockImplementationOnce(() =>
			of({
				data: {
					id: 'new-user-id',
				},
			} as AxiosResponse),
		);

		await userService.createUser(
			firstName,
			lastName,
			username,
			email,
			Role.USER,
			orgId,
		);

		expect(httpService.post).toHaveBeenCalledWith(
			'https://graph.microsoft.com/v1.0/users',
			{
				accountEnabled: true,
				givenName: firstName,
				surname: lastName,
				displayName: `${firstName} ${lastName}`,
				mail: email,
				passwordProfile: {
					forceChangePasswordNextSignIn: true,
					password: expect.any(String),
				},
				identities: [
					{
						signInType: 'userName',
						issuer: 'testtentant',
						issuerAssignedId: username,
					},
					{
						issuer: 'testtentant',
						issuerAssignedId: 'test@example.com',
						signInType: 'emailAddress',
					},
				],
				extension_testextensionappid_OrganizationId: orgId,
				extension_testextensionappid_Role: 'user',
			},
			{
				headers: {
					Authorization: `Bearer access-token`,
				},
			},
		);
	});

	it('should send requests to deactivate the user and revoke sessions', async () => {
		const userId = 'user-id';
		httpService.get.mockImplementation(() =>
			of({
				data: {
					access_token: 'access-token',
					expires_in: 3599,
				},
			} as AxiosResponse),
		);
		httpService.patch.mockImplementationOnce(() => of({} as AxiosResponse));
		httpService.post.mockImplementationOnce(() => of({} as AxiosResponse));

		await userService.deactivateUser(userId);

		expect(httpService.patch).toHaveBeenCalledWith(
			`https://graph.microsoft.com/v1.0/users/${userId}`,
			{ accountEnabled: false },
			{
				headers: {
					Authorization: `Bearer access-token`,
				},
			},
		);
		expect(httpService.post).toHaveBeenCalledWith(
			`https://graph.microsoft.com/v1.0/users/${userId}/revokeSignInSessions`,
			{},
			{
				headers: {
					Authorization: `Bearer access-token`,
				},
			},
		);

		expect(httpService.get).toHaveBeenCalledTimes(1); // Token should only be requested once
	});
});
