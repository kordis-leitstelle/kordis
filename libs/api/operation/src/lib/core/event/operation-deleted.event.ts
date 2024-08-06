export class OperationDeletedEvent {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
	) {}
}
