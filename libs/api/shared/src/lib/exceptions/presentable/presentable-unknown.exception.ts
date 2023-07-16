import { PresentableException } from './presentable.exception';

export class PresentableUnknownException extends PresentableException {
	readonly code = 'UNKNOWN_EXCEPTION';

	constructor() {
		super('Ein unbekannter Fehler ist aufgetreten.');
	}
}
