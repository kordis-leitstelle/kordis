export class OperationNotOngoingException extends Error {
	constructor() {
		super('Operation not ongoing');
	}
}
