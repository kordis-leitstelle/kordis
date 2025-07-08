import { PresentableException } from '@kordis/api/shared';

export class AlertFailedPresentableError extends PresentableException {
	readonly code = 'ALERT_FAILED';
	constructor() {
		super('Die Alarmierung der Alarmgruppen ist fehlgeschlagen!');
	}
}
