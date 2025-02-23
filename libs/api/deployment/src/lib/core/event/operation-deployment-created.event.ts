import { IEvent } from '@nestjs/cqrs';

export class OperationDeploymentCreatedEvent implements IEvent {
	constructor(
		readonly orgId: string,
		readonly deploymentId: string,
	) {}
}
