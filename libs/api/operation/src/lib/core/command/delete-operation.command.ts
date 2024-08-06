import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { InsufficientPermissionException } from '@kordis/api/shared';
import { AuthUser, Role } from '@kordis/shared/model';

import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationDeletedEvent } from '../event/operation-deleted.event';
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
		private readonly repository: OperationRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(cmd: DeleteOperationCommand): Promise<void> {
		const operation = await this.repository.findById(
			cmd.orgId,
			cmd.operationId,
		);

		// only org admins are allowed to delete archived operations
		if (
			operation.processState === OperationProcessState.ARCHIVED &&
			cmd.requestingUser.role !== Role.ORGANIZATION_ADMIN
		) {
			throw new InsufficientPermissionException();
		}

		await this.repository.update(cmd.orgId, cmd.operationId, {
			processState: OperationProcessState.DELETED,
		});

		this.eventBus.publish(new OperationDeletedEvent(cmd.orgId, operation.id));
	}
}
