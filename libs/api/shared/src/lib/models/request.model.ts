import { Request } from 'express';

import { AuthUser } from '@kordis/shared/auth';

export interface KordisGqlContext {
	req: KordisRequest;
}

export default interface KordisRequest extends Request {
	user: AuthUser;
}
