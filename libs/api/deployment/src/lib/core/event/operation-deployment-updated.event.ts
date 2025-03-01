import { IEvent } from '@nestjs/cqrs';

export class OperationDeploymentUpdatedEvent implements IEvent {
	constructor(
		readonly orgId: string,
		readonly deploymentId: string,
	) {}
}
