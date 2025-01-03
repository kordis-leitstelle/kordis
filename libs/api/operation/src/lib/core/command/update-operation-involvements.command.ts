import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_OF_WORK_SERVICE, UnitOfWorkService } from '@kordis/api/shared';

import {
	UpdateOperationAlertGroupInvolvementInput,
	UpdateOperationUnitInvolvementInput,
} from '../../infra/controller/args/update-operation-involvement.args';
import { OperationInvolvementsUpdatedEvent } from '../event/operation-involvements-updated.event';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';

export class UpdateOperationInvolvementsCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
		readonly unitInvolvements: UpdateOperationUnitInvolvementInput[],
		readonly alertGroupInvolvements: UpdateOperationAlertGroupInvolvementInput[],
	) {}
}

@CommandHandler(UpdateOperationInvolvementsCommand)
export class UpdateOperationInvolvementsHandler
	implements ICommandHandler<UpdateOperationInvolvementsCommand>
{
	constructor(
		private readonly unitInvolvementService: OperationInvolvementService,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uowService: UnitOfWorkService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: UpdateOperationInvolvementsCommand): Promise<void> {
		await this.uowService.asTransaction(async (uow) => {
			await this.unitInvolvementService.setUnitInvolvements(
				command.orgId,
				command.operationId,
				command.unitInvolvements,
				command.alertGroupInvolvements,
				uow,
			);
		});

		this.eventBus.publish(
			new OperationInvolvementsUpdatedEvent(command.orgId, command.operationId),
		);
	}
}
