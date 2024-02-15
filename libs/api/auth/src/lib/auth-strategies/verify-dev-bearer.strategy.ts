import { Request } from 'express';

import { AuthUser } from '@kordis/shared/auth';

import { VerifyAuthUserStrategy } from './verify-auth-user.strategy';

export class VerifyDevBearerStrategy extends VerifyAuthUserStrategy {
	verifyUserFromRequest(req: Request): Promise<AuthUser | null> {
		const headerValue = req.headers['authorization'];

		if (!headerValue) {
			return Promise.resolve(null);
		}
		const payloadBuffer = Buffer.from(headerValue.split('.')[1], 'base64');
		const decodedToken = JSON.parse(payloadBuffer.toString()) as {
			oid?: string;
			sub: string;
			emails: string[];
			given_name: string;
			family_name: string;
			organization: string;
		};

		return Promise.resolve({
			id: decodedToken['oid'] ?? decodedToken['sub'],
			email: decodedToken['emails'][0],
			firstName: decodedToken['given_name'],
			lastName: decodedToken['family_name'],
			organization: decodedToken['organization'],
		});
	}
}
