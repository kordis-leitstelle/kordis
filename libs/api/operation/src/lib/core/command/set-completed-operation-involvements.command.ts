import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_OF_WORK_SERVICE, UnitOfWorkService } from '@kordis/api/shared';

import {
	UpdateOperationAlertGroupInvolvementInput,
	UpdateOperationUnitInvolvementInput,
} from '../../infra/controller/args/update-operation-involvement.args';
import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationNotCompletedException } from '../exceptions/operation-not-completed.exception';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';

export class SetCompletedOperationInvolvementsCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
		readonly unitInvolvements: UpdateOperationUnitInvolvementInput[],
		readonly alertGroupInvolvements: UpdateOperationAlertGroupInvolvementInput[],
	) {}
}

@CommandHandler(SetCompletedOperationInvolvementsCommand)
export class SetCompletedOperationInvolvementsHandler
	implements ICommandHandler<SetCompletedOperationInvolvementsCommand>
{
	constructor(
		private readonly unitInvolvementService: OperationInvolvementService,
		@Inject(OPERATION_REPOSITORY)
		private readonly operationRepository: OperationRepository,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uowService: UnitOfWorkService,
		private readonly eventBus: EventBus,
	) {}

	async execute(
		command: SetCompletedOperationInvolvementsCommand,
	): Promise<void> {
		await this.uowService.asTransaction(async (uow) => {
			const { processState } = await this.operationRepository.findById(
				command.orgId,
				command.operationId,
				uow,
			);

			// Ongoing operations have to be managed via the operation manager due to easier communication with the deployment domain
			if (processState !== OperationProcessState.COMPLETED) {
				throw new OperationNotCompletedException();
			}

			await this.unitInvolvementService.setUnitInvolvements(
				command.orgId,
				command.operationId,
				command.unitInvolvements,
				command.alertGroupInvolvements,
				uow,
			);
		});
	}
}
