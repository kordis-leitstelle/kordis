export class OperationBaseDataUpdatedEvent {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
	) {}
}
