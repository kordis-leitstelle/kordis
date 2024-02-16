export class InsufficientPermissionException extends Error {
	constructor() {
		super('Insufficient permission for this operation.');
	}
}
