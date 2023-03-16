import { AuthUser } from '@kordis/shared/auth';

export default interface KordisRequest extends Request {
	req: unknown;
	user: AuthUser;
}
