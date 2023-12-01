import type { Request } from 'express';

import type { AuthUser } from '@kordis/shared/auth';

export interface KordisGqlContext {
	req: KordisRequest;
}

export interface KordisRequest extends Request {
	user: AuthUser;
}
