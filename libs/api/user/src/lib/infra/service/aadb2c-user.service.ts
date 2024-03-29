import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { stringify as qsStringify } from 'qs';
import { catchError, firstValueFrom, map } from 'rxjs';

import { Role } from '@kordis/shared/model';

import { UserEntity } from '../../core/entity/user.entity';
import { UserNotFoundException } from '../../core/exception/user-not-found.exception';
import { BaseUserService } from '../../core/service/user.service';

const MS_API_USER_KEY_MAP = Object.freeze(
	new Map([
		['firstName', 'givenName'],
		['lastName', 'surname'],
		['email', 'mail'],
		['username', 'userPrincipalName'],
	]),
);

const MS_GRAPH_API_BASE_URL = 'https://graph.microsoft.com/v1.0';

type AADB2CUser = {
	id: string;
	surname: string;
	givenName: string;
	mail: string;
	accountEnabled: boolean;
	identities: {
		signInType: string;
		issuerAssignedId: string;
	}[];
} & Record<string, string>;

// todo: check whether the graph api throws 404 and map it to UserNotFoundException
@Injectable()
export class AADB2CUserService extends BaseUserService {
	private bearerToken = '';
	private validUntil = new Date(0);
	private readonly tenant: string;
	private readonly extensionAppId: string;
	private readonly clientId: string;
	private readonly clientSecret: string;

	constructor(
		private readonly http: HttpService,
		config: ConfigService,
	) {
		super();
		this.tenant = config.getOrThrow<string>('AADB2C_TENANT_ID');
		this.extensionAppId = config.getOrThrow<string>('AADB2C_EXTENSION_APP_ID');
		this.clientId = config.getOrThrow<string>('AADB2C_CLIENT_ID');
		this.clientSecret = config.getOrThrow<string>('AADB2C_CLIENT_SECRET');
	}

	async updateEmail(
		orgId: string,
		userId: string,
		email: string,
	): Promise<void> {
		await this.ensureBearerToken();

		// identities will be completely replaced, so we still have to pass the username...
		const { userName, organizationId } = await this.getUserById(userId);
		if (organizationId !== orgId) {
			throw new UserNotFoundException();
		}

		await this.updateUserRequest(userId, {
			mail: email,
			identities: [
				{
					signInType: 'emailAddress',
					issuer: this.tenant,
					issuerAssignedId: email,
				},
				{
					signInType: 'userName',
					issuer: this.tenant,
					issuerAssignedId: userName,
				},
			],
		});
	}

	async updateRole(orgId: string, userId: string, role: Role): Promise<void> {
		await this.assertOrgMembership(orgId, userId);
		await this.updateUser(userId, {
			role,
		});
	}

	async createUser(
		firstName: string,
		lastName: string,
		username: string,
		email: string,
		role: Role,
		orgId: string,
	): Promise<UserEntity> {
		await this.ensureBearerToken();

		return firstValueFrom(
			this.http
				.post<AADB2CUser>(
					`${MS_GRAPH_API_BASE_URL}/users`,
					{
						accountEnabled: true,
						givenName: firstName,
						surname: lastName,
						displayName: `${firstName} ${lastName}`,
						mail: email,
						passwordProfile: {
							forceChangePasswordNextSignIn: true,
							password: randomBytes(16).toString('base64'),
						},
						identities: [
							{
								signInType: 'userName',
								issuer: this.tenant,
								issuerAssignedId: username,
							},
							{
								signInType: 'emailAddress',
								issuer: this.tenant,
								issuerAssignedId: email,
							},
						],
						[`extension_${this.extensionAppId}_Role`]: role,
						[`extension_${this.extensionAppId}_OrganizationId`]: orgId,
					},
					{
						headers: {
							Authorization: `Bearer ${this.bearerToken}`,
						},
					},
				)
				.pipe(map(({ data }) => this.mapAADB2CUserToUser(data))),
		);
	}

	async deactivateUser(orgId: string, userId: string): Promise<void> {
		await this.assertOrgMembership(orgId, userId);
		await this.updateUser(userId, {
			accountEnabled: false,
		});

		// also revoke all refresh tokens to invalidate active sessions
		await firstValueFrom(
			this.http
				.post(
					`${MS_GRAPH_API_BASE_URL}/users/${userId}/revokeSignInSessions`,
					{},
					{
						headers: {
							Authorization: `Bearer ${this.bearerToken}`,
						},
					},
				)
				.pipe(
					catchError((err, user$) => {
						if (err.response.status === 404) {
							throw new UserNotFoundException();
						}
						return user$;
					}),
				),
		);
	}

	async reactivateUser(orgId: string, userId: string): Promise<void> {
		await this.assertOrgMembership(orgId, userId);
		await this.updateUser(userId, {
			accountEnabled: true,
		});
	}

	async getOrganizationUsers(orgId: string): Promise<UserEntity[]> {
		await this.ensureBearerToken();

		const resp = await firstValueFrom(
			this.http.get<{
				value: AADB2CUser[];
			}>(
				`${MS_GRAPH_API_BASE_URL}/users?$select=id,surname,givenName,accountEnabled,mail,identities,extension_${this.extensionAppId}_OrganizationId,extension_${this.extensionAppId}_Role`,
				{
					headers: {
						Authorization: `Bearer ${this.bearerToken}`,
					},
				},
			),
		);

		// currently there is no way to filter users by extension attribute via the graph api, that is why we have to filter them
		return resp.data.value
			.filter(
				(user) =>
					user[`extension_${this.extensionAppId}_OrganizationId`] === orgId,
			)
			.map((user) => this.mapAADB2CUserToUser(user));
	}

	async getUser(orgId: string, id: string): Promise<UserEntity> {
		const user = await this.getUserById(id);
		if (user.organizationId !== orgId) {
			throw new UserNotFoundException();
		} else {
			return user;
		}
	}

	/*
	 * Returns the last login history of the last n successful logins of a user
	 */
	async getLoginHistory(
		orgId: string,
		userId: string,
		historyLength: number,
	): Promise<Date[]> {
		await this.assertOrgMembership(orgId, userId);
		await this.ensureBearerToken();

		// azure restricts audit log to the last 7 days
		const resp = await firstValueFrom(
			this.http
				.get<{
					value: {
						createdDateTime: string;
					}[];
				}>(
					`${MS_GRAPH_API_BASE_URL}/auditLogs/signIns?$top=${historyLength}&$filter=userId eq '${userId}' and status/errorCode eq 0`,
					{
						headers: {
							Authorization: `Bearer ${this.bearerToken}`,
						},
					},
				)
				.pipe(
					catchError((err, user$) => {
						if (err.response.status === 404) {
							throw new UserNotFoundException();
						}
						return user$;
					}),
				),
		);

		return resp.data.value.map(
			({ createdDateTime }) => new Date(createdDateTime),
		);
	}

	protected async getUserById(id: string): Promise<UserEntity> {
		await this.ensureBearerToken();

		return firstValueFrom(
			this.http
				.get<AADB2CUser>(
					`${MS_GRAPH_API_BASE_URL}/users/${id}?$select=id,surname,accountEnabled,givenName,mail,identities,extension_${this.extensionAppId}_OrganizationId,extension_${this.extensionAppId}_Role`,
					{
						headers: {
							Authorization: `Bearer ${this.bearerToken}`,
						},
					},
				)
				.pipe(
					map(({ data }) => this.mapAADB2CUserToUser(data)),
					catchError((err, user$) => {
						if (err.response.status === 404) {
							throw new UserNotFoundException();
						}
						return user$;
					}),
				),
		);
	}

	private async updateUser(
		userId: string,
		user: Partial<
			Omit<UserEntity, 'organizationId'> & {
				accountEnabled: boolean;
			}
		>,
	): Promise<void> {
		await this.ensureBearerToken();

		const updatePayload: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(user)) {
			if (MS_API_USER_KEY_MAP.has(key)) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const msKey = MS_API_USER_KEY_MAP.get(key)!;
				updatePayload[msKey] = value;
			} else if (key === 'role') {
				updatePayload[`extension_${this.extensionAppId}_Role`] = value;
			} else {
				updatePayload[key] = value;
			}
		}

		await this.updateUserRequest(userId, updatePayload);
	}

	private async updateUserRequest(
		userId: string,
		data: Record<string, unknown>,
	): Promise<void> {
		await firstValueFrom(
			this.http
				.patch(`${MS_GRAPH_API_BASE_URL}/users/${userId}`, data, {
					headers: {
						Authorization: `Bearer ${this.bearerToken}`,
					},
				})
				.pipe(
					catchError((err, response) => {
						if (err.response.status === 404) {
							throw new UserNotFoundException();
						}
						return response;
					}),
				),
		);
	}

	private async ensureBearerToken(): Promise<void> {
		if (this.validUntil > new Date()) {
			return;
		}

		const data = qsStringify({
			grant_type: 'client_credentials',
			client_id: this.clientId,
			scope: 'https://graph.microsoft.com/.default',
			client_secret: this.clientSecret,
		});

		const resp = await firstValueFrom(
			this.http.get<{
				token_type: string;
				expires_in: number;
				ext_expires_in: number;
				access_token: string;
			}>(`https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/token`, {
				data,
			}),
		);
		this.bearerToken = resp.data.access_token;
		this.validUntil = new Date(Date.now() + (resp.data.expires_in - 10) * 1000); // cut of 10 seconds to have some overlap for request time
	}

	private mapAADB2CUserToUser(user: AADB2CUser): UserEntity {
		return {
			id: user.id,
			firstName: user.givenName,
			lastName: user.surname,
			email: user.mail,
			userName:
				user.identities?.find((identity) => identity.signInType === 'userName')
					?.issuerAssignedId ?? '',
			deactivated: !user.accountEnabled,
			role: user[`extension_${this.extensionAppId}_Role`] as Role,
			organizationId: user[`extension_${this.extensionAppId}_OrganizationId`],
		};
	}
}
