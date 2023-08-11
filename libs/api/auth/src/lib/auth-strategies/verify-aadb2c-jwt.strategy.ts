import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

import { AuthUser } from '@kordis/shared/auth';

import { VerifyAuthUserStrategy } from './verify-auth-user.strategy';

declare module 'jsonwebtoken' {
	export interface JwtPayload {
		sub?: string;
		oid: string;
		emails: string[];
		given_name: string;
		family_name: string;
		organization: string;
	}
}

@Injectable()
export class VerifyAADB2CJWTStrategy extends VerifyAuthUserStrategy {
	private readonly client: jwksClient.JwksClient;
	private readonly verifyOptions: jwt.VerifyOptions;

	constructor(config: ConfigService) {
		super();

		const tenant = config.getOrThrow<string>('AADB2C_TENANT_NAME');
		const signInPolicy = config.getOrThrow<string>('AADB2C_SIGN_IN_POLICY');
		const clientId = config.getOrThrow<string>('AADB2C_CLIENT_ID');
		const issuer = config.getOrThrow<string>('AADB2C_ISSUER');

		this.verifyOptions = {
			algorithms: ['RS256'],
			audience: clientId,
			issuer,
		};
		this.client = jwksClient({
			jwksUri: `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${signInPolicy}/discovery/v2.0/keys`,
		});
	}

	async verifyUserFromRequest(req: Request): Promise<AuthUser | null> {
		const authHeaderValue = req.headers['authorization'];

		if (!authHeaderValue) {
			return null;
		}
		const bearerToken = authHeaderValue.split(' ')[1];

		const decodedToken = jwt.decode(bearerToken, {
			complete: true,
		});
		if (!decodedToken) {
			return null;
		}

		const key = await this.client.getSigningKey(decodedToken.header.kid);
		const publicKey = key.getPublicKey();

		try {
			jwt.verify(bearerToken, publicKey, this.verifyOptions);
		} catch {
			return null;
		}

		const { payload } = decodedToken;
		if (typeof payload === 'string') {
			return null;
		}

		return {
			id: payload['sub'] ?? payload['oid'],
			email: payload['emails'][0],
			firstName: payload['given_name'],
			lastName: payload['family_name'],
			organization: payload['organization'],
		};
	}
}
