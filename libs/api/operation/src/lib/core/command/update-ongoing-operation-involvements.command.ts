import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_OF_WORK_SERVICE, UnitOfWorkService } from '@kordis/api/shared';

import { OngoingOperationInvolvementsUpdatedEvent } from '../event';
import {
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../repository/operation-involvement.repository';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';
import { UpdatedInvolvementsManager } from '../service/updated-involvements.manager';

export class UpdateOngoingOperationInvolvementsCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
		readonly assignedUnitIds: string[],
		readonly alertGroupInvolvements: {
			alertGroupId: string;
			assignedUnitIds: string[];
		}[],
	) {}
}

@CommandHandler(UpdateOngoingOperationInvolvementsCommand)
export class UpdateOngoingOperationInvolvementsHandler
	implements ICommandHandler<UpdateOngoingOperationInvolvementsCommand>
{
	constructor(
		private readonly involvementService: OperationInvolvementService,
		private readonly eventBus: EventBus,
		@Inject(OPERATION_INVOLVEMENT_REPOSITORY)
		private readonly operationInvolvementsRepository: OperationInvolvementsRepository,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uowService: UnitOfWorkService,
	) {}

	async execute(cmd: UpdateOngoingOperationInvolvementsCommand): Promise<void> {
		const endDate = new Date();

		await this.uowService.asTransaction(async (uow) => {
			// Create an involvement manager to handle the operations with reduced parameter passing
			const involvementManager = new UpdatedInvolvementsManager(
				this.involvementService,
				this.operationInvolvementsRepository,
				cmd,
				endDate,
				uow,
			);

			// Initialize the manager (loads current involvements and prepares data structures)
			await involvementManager.initialize();

			// Process unit involvements and alert group involvements
			await involvementManager.handleUnitInvolvements();
			await involvementManager.handleAlertGroupInvolvements();

			this.eventBus.publish(
				new OngoingOperationInvolvementsUpdatedEvent(
					cmd.orgId,
					cmd.operationId,
				),
			);
		});
	}
}
