export class OperationNotFoundException extends Error {
	constructor() {
		super('Operation not found');
	}
}
