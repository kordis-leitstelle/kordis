export class OperationNotCompletedException extends Error {
	constructor() {
		super('Operation is not in a completed state that allows this action');
	}
}
