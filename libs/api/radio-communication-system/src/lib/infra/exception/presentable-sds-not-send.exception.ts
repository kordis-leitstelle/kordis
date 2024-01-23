import { PresentableException } from '@kordis/api/shared';

export class PresentableSdsNotSendException extends PresentableException {
	readonly code = 'SDS_NOT_SEND_EXCEPTION';

	constructor() {
		super('Die SDS konnte nicht gesendet werden.');
	}
}
