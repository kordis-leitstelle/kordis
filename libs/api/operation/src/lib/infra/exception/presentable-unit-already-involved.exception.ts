import { PresentableException } from '@kordis/api/shared';

export class PresentableUnitAlreadyInvolvedException extends PresentableException {
	readonly code = 'UNIT_ALREADY_INVOLVED';

	constructor(unitCallSign: string, operationSign: string) {
		super(
			"Die Einheit '" +
				unitCallSign +
				"' ist bereits in dem Zeitraum an der Operation '" +
				operationSign +
				"' beteiligt.",
		);
	}
}
