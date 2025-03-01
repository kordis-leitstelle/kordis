import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { UNIT_OF_WORK_SERVICE, UnitOfWorkService } from '@kordis/api/shared';

import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationEndedEvent } from '../event/operation-ended.event';
import { OperationNotOngoingException } from '../exceptions/operation-not-ongoing.exception';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';

export class EndOngoingOperationCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
		readonly end: Date,
	) {}
}

@CommandHandler(EndOngoingOperationCommand)
export class EndOngoingOperationHandler
	implements ICommandHandler<EndOngoingOperationCommand>
{
	constructor(
		@Inject(OPERATION_REPOSITORY)
		private readonly operationRepository: OperationRepository,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uowService: UnitOfWorkService,
		private readonly involvementService: OperationInvolvementService,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		orgId,
		operationId,
		end,
	}: EndOngoingOperationCommand): Promise<void> {
		await this.uowService.asTransaction(async (uow) => {
			const operation = await this.operationRepository.findById(
				orgId,
				operationId,
				uow,
			);

			if (operation.processState !== OperationProcessState.ON_GOING) {
				throw new OperationNotOngoingException();
			}

			await this.operationRepository.update(
				orgId,
				operationId,
				{
					end,
					processState: OperationProcessState.COMPLETED,
				},
				uow,
			);

			await this.involvementService.endInvolvements(
				orgId,
				operationId,
				end,
				uow,
			);

			this.eventBus.publish(new OperationEndedEvent(orgId, operationId));
		});
	}
}
