export class OperationArchivedEvent {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
	) {}
}
