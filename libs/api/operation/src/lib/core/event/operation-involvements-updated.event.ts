export class OperationInvolvementsUpdatedEvent {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
	) {}
}
