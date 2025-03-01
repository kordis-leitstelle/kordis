import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';

import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationArchivedEvent } from '../event/operation-archived.event';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';

export class ArchiveOperationCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
	) {}
}

@CommandHandler(ArchiveOperationCommand)
export class ArchiveOperationHandler
	implements ICommandHandler<ArchiveOperationCommand>
{
	private readonly logger: KordisLogger = new Logger(
		ArchiveOperationHandler.name,
	);

	constructor(
		@Inject(OPERATION_REPOSITORY)
		private readonly repository: OperationRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(cmd: ArchiveOperationCommand): Promise<void> {
		const operation = await this.repository.findById(
			cmd.orgId,
			cmd.operationId,
		);
		operation.processState = OperationProcessState.ARCHIVED;

		await operation.validOrThrow(['archived']);

		await this.repository.update(cmd.orgId, cmd.operationId, {
			processState: OperationProcessState.ARCHIVED,
		});

		this.logger.log(`Operation ${operation.id} archived`);

		this.eventBus.publish(new OperationArchivedEvent(cmd.orgId, operation.id));
	}
}
