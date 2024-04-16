import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';

import { Operation } from '../entity/operation.entity';
import { OperationCreatedEvent } from '../event/operation-created.event';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import {
	SIGN_GENERATOR,
	SignGenerator,
} from '../service/sign-generator.strategy';

export class CreateOperationCommand {
	constructor(
		readonly orgId: string,
		readonly start: Date,
		readonly end?: Date,
	) {}
}

@CommandHandler(CreateOperationCommand)
export class CreateOperationCommandHandler
	implements ICommandHandler<CreateOperationCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateOperationCommandHandler.name,
	);

	constructor(
		@Inject(OPERATION_REPOSITORY)
		private readonly repository: OperationRepository,
		private readonly eventBus: EventBus,
		@Inject(SIGN_GENERATOR) private readonly signGenerator: SignGenerator,
	) {}

	async execute({
		start,
		end,
		orgId,
	}: CreateOperationCommand): Promise<Operation> {
		let operation = new Operation();
		operation.orgId = orgId;
		operation.sign = await this.signGenerator.generateNextOperationSign(orgId);
		operation.start = start;
		if (end) {
			operation.end = end;
		}

		await operation.validOrThrow();

		operation = await this.repository.create(operation);
		this.logger.log(
			`Operation ${operation.sign} created for organization ${orgId}`,
		);

		this.eventBus.publish(new OperationCreatedEvent(operation));

		return operation;
	}
}
