import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import {
	InsufficientPermissionException,
	UNIT_OF_WORK_SERVICE,
	UnitOfWorkService,
} from '@kordis/api/shared';
import { AuthUser, Role } from '@kordis/shared/model';

import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationDeletedEvent } from '../event/operation-deleted.event';
import {
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../repository/operation-involvement.repository';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';

export class DeleteOperationCommand {
	constructor(
		readonly orgId: string,
		readonly requestingUser: AuthUser,
		readonly operationId: string,
	) {}
}

@CommandHandler(DeleteOperationCommand)
export class DeleteOperationHandler
	implements ICommandHandler<DeleteOperationCommand>
{
	private readonly logger: KordisLogger = new Logger(
		DeleteOperationHandler.name,
	);

	constructor(
		@Inject(OPERATION_REPOSITORY)
		private readonly operationRepository: OperationRepository,
		@Inject(OPERATION_INVOLVEMENT_REPOSITORY)
		private readonly operationInvolvementsRepository: OperationInvolvementsRepository,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uowService: UnitOfWorkService,
		private readonly eventBus: EventBus,
	) {}

	async execute(cmd: DeleteOperationCommand): Promise<void> {
		await this.uowService.asTransaction(async (uow) => {
			const operation = await this.operationRepository.findById(
				cmd.orgId,
				cmd.operationId,
				uow,
			);

			// only org admins are allowed to delete archived operations
			if (
				operation.processState === OperationProcessState.ARCHIVED &&
				cmd.requestingUser.role !== Role.ORGANIZATION_ADMIN
			) {
				throw new InsufficientPermissionException();
			}

			await this.operationRepository.update(
				cmd.orgId,
				cmd.operationId,
				{
					processState: OperationProcessState.DELETED,
				},
				uow,
			);

			await this.operationInvolvementsRepository.setDeletedFlag(
				cmd.orgId,
				cmd.operationId,
				true,
				uow,
			);

			this.eventBus.publish(new OperationDeletedEvent(cmd.orgId, operation.id));
		});
	}
}
