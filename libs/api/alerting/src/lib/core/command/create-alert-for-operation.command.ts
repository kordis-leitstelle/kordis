import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { KordisLogger } from '@kordis/api/observability';
import { OperationViewModel } from '@kordis/api/operation';

import { ALERT_SERVICE, AlertService } from '../alert.service';

export class CreateAlertForOperationCommand {
	constructor(
		readonly alertGroupIds: string[],
		readonly description: string,
		readonly operation: OperationViewModel,
		readonly hasPriority: boolean,
		readonly orgId: string,
	) {}
}

@CommandHandler(CreateAlertForOperationCommand)
export class CreateAlertForOperationCommandHandler
	implements ICommandHandler<CreateAlertForOperationCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateAlertForOperationCommandHandler.name,
	);

	constructor(
		@Inject(ALERT_SERVICE)
		private readonly alertService: AlertService,
	) {}

	async execute({
		alertGroupIds,
		operation,
		hasPriority,
		orgId,
	}: CreateAlertForOperationCommand): Promise<void> {
		await this.alertService.alertWithOperation(
			alertGroupIds,
			operation,
			hasPriority,
			orgId,
		);

		this.logger.log('Alert created for operation', {
			operationId: operation.id,
			alertGroupIds,
			orgId,
		});
	}
}
