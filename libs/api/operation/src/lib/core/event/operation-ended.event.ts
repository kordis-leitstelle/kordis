import { IEvent } from '@nestjs/cqrs';

export class OperationEndedEvent implements IEvent {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
	) {}
}
