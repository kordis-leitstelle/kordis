import { Request } from 'express';

import { AuthUser } from '@kordis/shared/model';

export interface KordisGqlContext {
	req: KordisRequest;
}

export interface KordisRequest extends Request {
	user: AuthUser;
}
