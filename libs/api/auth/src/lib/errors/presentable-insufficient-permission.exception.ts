import { PresentableException } from '@kordis/api/shared';

export class PresentableInsufficientPermissionException extends PresentableException {
	readonly code = 'INSUFFICIENT_PERMISSION';

	constructor() {
		super(
			'Sie benötigen eine höhere Berechtigung, um diese Aktion auszuführen.',
		);
	}
}
