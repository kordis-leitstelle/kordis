import { PresentableException } from '@kordis/api/shared';

export class PresentableUnauthorizedException extends PresentableException {
	readonly code = 'UNAUTHORIZED';

	constructor() {
		super('Sie sind nicht autorisiert.');
	}
}
