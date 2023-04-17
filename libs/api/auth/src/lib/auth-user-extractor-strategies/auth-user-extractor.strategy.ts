import { Request } from 'express';

import { AuthUser } from '@kordis/shared/auth';

export abstract class AuthUserExtractorStrategy {
	abstract getUserFromRequest(req: Request): AuthUser | null;
}

export class ExtractUserFromMsPrincipleHeader extends AuthUserExtractorStrategy {
	getUserFromRequest(req: Request): AuthUser | null {
		const headerValue = req.headers['authorization'];

		if (!headerValue) {
			return null;
		}

		const tokenParts = headerValue.split('.');
		if (tokenParts.length < 2) {
			return null;
		}

		const payloadBuffer = Buffer.from(tokenParts[1], 'base64');
		const decodedToken = JSON.parse(payloadBuffer.toString());

		return {
			id: decodedToken['oid'] || decodedToken['sub'],
			email: decodedToken['emails']?.[0],
			firstName: decodedToken['given_name'],
			lastName: decodedToken['family_name'],
		};
	}
}
