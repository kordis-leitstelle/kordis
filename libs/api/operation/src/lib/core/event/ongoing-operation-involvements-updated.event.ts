// This event is fired, if any involvement of an ongoing operation is updated
export class OngoingOperationInvolvementsUpdatedEvent {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
	) {}
}
