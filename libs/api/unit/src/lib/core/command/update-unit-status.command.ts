import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { KordisLogger } from '@kordis/api/observability';

import { PersistentUnitStatus } from '../entity/status.type';
import { UnitStatus } from '../entity/unit.entity';
import { UnitStatusUpdatedEvent } from '../event/unit-status-updated.event';
import { UnitStatusOutdatedException } from '../exception/unit-status-outdated.exception';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';

export class UpdateUnitStatusCommand {
	constructor(
		readonly orgId: string,
		readonly unitId: string,
		readonly status: PersistentUnitStatus | null,
		readonly receivedAt: Date,
		readonly source: string,
	) {}
}

@CommandHandler(UpdateUnitStatusCommand)
export class UpdateUnitStatusHandler
	implements ICommandHandler<UpdateUnitStatusCommand, void>
{
	private readonly logger: KordisLogger = new Logger(
		UpdateUnitStatusHandler.name,
	);

	constructor(
		@Inject(UNIT_REPOSITORY)
		private readonly repository: UnitRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		orgId,
		unitId,
		status,
		receivedAt,
		source,
	}: UpdateUnitStatusCommand): Promise<void> {
		const unitStatus = new UnitStatus();
		unitStatus.status = status;
		unitStatus.receivedAt = receivedAt;
		unitStatus.source = source;

		await unitStatus.validOrThrow();

		const updateSucceeded = await this.repository.updateStatus(
			orgId,
			unitId,
			unitStatus,
		);

		if (!updateSucceeded) {
			this.logger.error(`Unit ${unitId} status update failed: outdated status`);
			throw new UnitStatusOutdatedException();
		}

		this.eventBus.publish(
			new UnitStatusUpdatedEvent(orgId, unitId, unitStatus),
		);

		this.logger.log(`Unit ${unitId} status updated`, unitStatus);
	}
}
