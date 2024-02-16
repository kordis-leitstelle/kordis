import { Request } from 'express';

import { AuthUser, Role } from '@kordis/shared/model';

import { VerifyAuthUserStrategy } from './verify-auth-user.strategy';

export class VerifyDevBearerStrategy extends VerifyAuthUserStrategy {
	verifyUserFromRequest(req: Request): Promise<AuthUser | null> {
		const authHeaderValue = req.headers['authorization'];

		if (!authHeaderValue) {
			return Promise.resolve(null);
		}

		const payloadBuffer = Buffer.from(authHeaderValue.split('.')[1], 'base64');
		const decodedToken = JSON.parse(payloadBuffer.toString()) as {
			oid?: string;
			sub: string;
			emails: string[];
			given_name: string;
			family_name: string;
			extension_OrganizationId: string;
			extension_Role: string;
		};

		return Promise.resolve({
			id: decodedToken['oid'] ?? decodedToken['sub'],
			email: decodedToken['emails'][0],
			firstName: decodedToken['given_name'],
			lastName: decodedToken['family_name'],
			organizationId: decodedToken['extension_OrganizationId'],
			role: decodedToken['extension_Role'] as Role,
		});
	}
}
