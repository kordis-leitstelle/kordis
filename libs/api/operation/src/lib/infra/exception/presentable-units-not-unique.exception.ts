import { PresentableException } from '@kordis/api/shared';

export class PresentableUnitsNotUniqueException extends PresentableException {
	readonly code = 'UNITS_NOT_UNIQUE';

	override readonly furtherExtensions = {
		nonUniqueUnitIds: this.nonUniqueUnitIds,
	};

	constructor(readonly nonUniqueUnitIds: string[]) {
		super('Einheiten können initial nur einmal pro Einsatz beteiligt sein.');
	}
}
