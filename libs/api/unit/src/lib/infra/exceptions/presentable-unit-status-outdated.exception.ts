import { PresentableException } from '@kordis/api/shared';

export class PresentableUnitStatusOutdatedException extends PresentableException {
	readonly code = 'UNIT_STATUS_OUTDATED';

	constructor() {
		super('Der Status der Einheit wurde in der Zwischenzeit bereits geändert.');
	}
}
