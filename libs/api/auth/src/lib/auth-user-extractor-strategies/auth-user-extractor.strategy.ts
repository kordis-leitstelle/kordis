import type { Request } from 'express';

import type { AuthUser } from '@kordis/shared/auth';

export abstract class AuthUserExtractorStrategy {
	abstract getUserFromRequest(req: Request): AuthUser | null;
}

export class ExtractUserFromMsPrincipleHeader extends AuthUserExtractorStrategy {
	getUserFromRequest(req: Request): AuthUser | null {
		const headerValue = req.headers['authorization'];

		if (!headerValue) {
			return null;
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

		return {
			id: decodedToken['oid'] || decodedToken['sub'],
			email: decodedToken['emails'][0],
			firstName: decodedToken['given_name'],
			lastName: decodedToken['family_name'],
			organization: decodedToken['organization'],
		};
	}
}
