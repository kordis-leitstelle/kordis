import { IEvent } from '@nestjs/cqrs';

export class OngoingOperationEndedEvent implements IEvent {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
	) {}
}
