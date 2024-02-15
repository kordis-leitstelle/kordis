import { Request } from 'express';

import { AuthUser } from '@kordis/shared/auth';

export abstract class VerifyAuthUserStrategy {
	/*
	 * Returns the AuthUser if the user is authenticated, otherwise null.
	 */
	abstract verifyUserFromRequest(req: Request): Promise<AuthUser | null>;
}
