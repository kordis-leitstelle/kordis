import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';

import { Role } from '@kordis/shared/model';

import { UserNotFoundException } from '../../core/exception/user-not-found.exception';
import { AADB2CUserService } from './aadb2c-user.service';

describe('AADB2CUserService', () => {
	let userService: AADB2CUserService;
	let httpService: DeepMocked<HttpService>;

	const tenantId = 'testtentant';
	const extensionAppId = 'testextensionappid';
	const clientId = 'clientId';
	const clientSecret = 'clientSecret';
	const mockBearerFactory = () =>
		of({
			data: {
				access_token: 'access-token',
				expires_in: 3600,
			},
		} as AxiosResponse);

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

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should send request to update the email', async () => {
		const userId = 'user-id';
		const orgId = 'org-id';
		const email = 'test@example.com';

		httpService.get
			.mockImplementationOnce(mockBearerFactory)
			.mockImplementationOnce(() =>
				of({
					data: {
						[`extension_${extensionAppId}_OrganizationId`]: orgId,
						id: userId,
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
		await userService.updateEmail(orgId, userId, email);

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

	it('should send request to update the role', async () => {
		const userId = 'user-id';
		const role = Role.ADMIN;
		const orgId = 'org-id';
		httpService.get
			.mockImplementationOnce(mockBearerFactory)
			.mockImplementationOnce(() =>
				of({
					data: {
						[`extension_${extensionAppId}_OrganizationId`]: orgId,
					},
				} as AxiosResponse),
			);

		httpService.patch.mockImplementationOnce(() => of({} as AxiosResponse));
		await userService.updateRole(orgId, userId, role);

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
		httpService.get.mockImplementationOnce(mockBearerFactory);

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
		const orgId = 'org-id';
		httpService.get
			.mockImplementationOnce(mockBearerFactory)
			.mockImplementationOnce(() =>
				of({
					data: {
						[`extension_${extensionAppId}_OrganizationId`]: orgId,
					},
				} as AxiosResponse),
			);
		httpService.patch.mockImplementationOnce(() => of({} as AxiosResponse));
		httpService.post.mockImplementationOnce(() => of({} as AxiosResponse));

		await userService.deactivateUser(orgId, userId);

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
	});

	const assertUserNotFoundException = async () => {
		await expect(
			userService.getUser('orgId', 'nonexistent-user-id'),
		).rejects.toThrow(UserNotFoundException);
		await expect(
			userService.reactivateUser('orgId', 'nonexistent-user-id'),
		).rejects.toThrow(UserNotFoundException);
		await expect(
			userService.updateRole(
				'orgId',
				'nonexistent-user-id',
				Role.ORGANIZATION_ADMIN,
			),
		).rejects.toThrow(UserNotFoundException);
		await expect(
			userService.updateEmail('orgId', 'nonexistent-user-id', 'email'),
		).rejects.toThrow(UserNotFoundException);
		await expect(
			userService.deactivateUser('orgId', 'nonexistent-user-id'),
		).rejects.toThrow(UserNotFoundException);

		return true;
	};

	it('should throw UserNotFoundException when user not found', async () => {
		httpService.get
			.mockImplementationOnce(mockBearerFactory)
			.mockImplementation(() =>
				throwError(() => ({
					response: {
						status: 404,
					},
				})),
			);
		await expect(assertUserNotFoundException()).resolves.toBeTruthy();
	});

	it('should throw UserNotFoundException when userId is not from organization', async () => {
		httpService.get
			.mockImplementationOnce(mockBearerFactory)
			.mockImplementation(() =>
				of({
					data: {
						[`extension_${extensionAppId}_OrganizationId`]: 'other-org-id',
					},
				} as AxiosResponse),
			);

		await expect(assertUserNotFoundException()).resolves.toBeTruthy();
	});
});
