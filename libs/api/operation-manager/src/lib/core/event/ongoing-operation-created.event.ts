import { IEvent } from '@nestjs/cqrs';

import { OperationViewModel } from '@kordis/api/operation';

export class OngoingOperationCreatedEvent implements IEvent {
	constructor(
		readonly orgId: string,
		readonly operation: Readonly<OperationViewModel>,
	) {}
}
