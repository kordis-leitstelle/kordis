import { Request } from 'express';

import { AuthUser } from '@kordis/shared/auth';

export default interface KordisRequest extends Request {
	user: AuthUser;
}
