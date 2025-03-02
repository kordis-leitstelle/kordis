import { PresentableException } from '@kordis/api/shared';

export class PresentableUnitsNotUniqueException extends PresentableException {
	readonly code = 'UNITS_NOT_UNIQUE';

	constructor(readonly nonUniqueUnitIds: string[]) {
		super('Einheiten können initial nur einmal pro Einsatz beteiligt sein.');

		this.furtherExtensions = {
			nonUniqueUnitIds: this.nonUniqueUnitIds,
		};
	}
}
