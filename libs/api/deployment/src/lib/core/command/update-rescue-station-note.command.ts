import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { RescueStationNoteUpdatedEvent } from '../event/rescue-station-note-updated.event';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../repository/rescue-station-deployment.repository';

export class UpdateRescueStationNoteCommand {
	constructor(
		readonly orgId: string,
		readonly rescueStationId: string,
		readonly note: string,
	) {}
}

@CommandHandler(UpdateRescueStationNoteCommand)
export class UpdateRescueStationNoteHandler
	implements ICommandHandler<UpdateRescueStationNoteCommand>
{
	constructor(
		@Inject(RESCUE_STATION_DEPLOYMENT_REPOSITORY)
		private readonly rescueStationDeploymentRepository: RescueStationDeploymentRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		orgId,
		rescueStationId,
		note,
	}: UpdateRescueStationNoteCommand): Promise<void> {
		await this.rescueStationDeploymentRepository.updateOne(
			orgId,
			rescueStationId,
			{
				note,
			},
		);

		this.eventBus.publish(
			new RescueStationNoteUpdatedEvent(orgId, rescueStationId),
		);
	}
}
