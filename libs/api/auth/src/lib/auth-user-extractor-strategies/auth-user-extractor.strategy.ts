import { Request } from 'express';

import { AuthUser, Role } from '@kordis/shared/auth';

export abstract class AuthUserExtractorStrategy {
	abstract getUserFromRequest(req: Request): AuthUser | null;
}

export class ExtractUserFromMsPrincipleHeader extends AuthUserExtractorStrategy {
	getUserFromRequest(req: Request): AuthUser | null {
		const authHeaderValue = req.headers['authorization'];

		if (!authHeaderValue) {
			return null;
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

		return {
			id: decodedToken['oid'] || decodedToken['sub'],
			email: decodedToken['emails'][0],
			firstName: decodedToken['given_name'],
			lastName: decodedToken['family_name'],
			organizationId: decodedToken['extension_OrganizationId'],
			role: decodedToken['extension_Role'] as Role,
		};
	}
}
