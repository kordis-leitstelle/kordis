import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { OperationBaseDataUpdatedEvent } from '../event/operation-base-data-updated.event';
import { UpdateOperationDto } from '../repository/dto/update-operation.dto';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';

export class UpdateOperationBaseDataCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
		readonly data: Partial<UpdateOperationDto>,
	) {}
}

@CommandHandler(UpdateOperationBaseDataCommand)
export class UpdateOperationBaseDataHandler
	implements ICommandHandler<UpdateOperationBaseDataCommand>
{
	constructor(
		@Inject(OPERATION_REPOSITORY)
		private readonly repository: OperationRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		data,
		orgId,
		operationId,
	}: UpdateOperationBaseDataCommand): Promise<void> {
		await this.repository.update(orgId, operationId, data);

		this.eventBus.publish(
			new OperationBaseDataUpdatedEvent(orgId, operationId),
		);
	}
}
