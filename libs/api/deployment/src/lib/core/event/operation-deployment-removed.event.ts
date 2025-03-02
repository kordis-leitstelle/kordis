import { IEvent } from '@nestjs/cqrs';

export class OperationDeploymentRemovedEvent implements IEvent {
	constructor(
		readonly orgId: string,
		readonly deploymentId: string,
	) {}
}
