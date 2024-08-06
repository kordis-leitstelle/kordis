import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { OperationInvolvementsUpdatedEvent } from '../event/operation-involvements-updated.event';
import {
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../repository/operation-involvement.repository';

export class StartPendingUnitInvolvementCommand {
	constructor(
		readonly orgId: string,
		readonly unitId: string,
		readonly operationId: string,
		readonly start: Date,
	) {}
}

@CommandHandler(StartPendingUnitInvolvementCommand)
export class StartPendingUnitInvolvementHandler
	implements ICommandHandler<StartPendingUnitInvolvementCommand>
{
	constructor(
		@Inject(OPERATION_INVOLVEMENT_REPOSITORY)
		private readonly repository: OperationInvolvementsRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		orgId,
		unitId,
		operationId,
		start,
	}: StartPendingUnitInvolvementCommand): Promise<void> {
		await this.repository.addStartOfPendingUnit(
			orgId,
			operationId,
			unitId,
			start,
		);

		this.eventBus.publish(
			new OperationInvolvementsUpdatedEvent(orgId, operationId),
		);
	}
}
