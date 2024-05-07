import {
	CommandBus,
	CommandHandler,
	EventBus,
	ICommandHandler,
} from '@nestjs/cqrs';

import { UpdateSignedInRescueStationCommand } from '@kordis/api/deployment';

import { SignedInRescueStationUpdatedEvent } from '../event/signed-in-rescue-station-updated.event';

export class StartUpdateSignedInRescueStationProcessCommand {
	constructor(
		readonly orgId: string,
		readonly rescueStationData: {
			rescueStationId: string;
			assignedAlertGroups: {
				alertGroupId: string;
				unitIds: string[];
			}[];
			assignedUnitIds: string[];
			note: string;
			strength: {
				leaders: number;
				subLeaders: number;
				helpers: number;
			};
		},
	) {}
}

@CommandHandler(StartUpdateSignedInRescueStationProcessCommand)
export class UpdateSignedInRescueStationHandler
	implements ICommandHandler<StartUpdateSignedInRescueStationProcessCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
	) {}

	async execute(
		command: StartUpdateSignedInRescueStationProcessCommand,
	): Promise<void> {
		await this.commandBus.execute(
			new UpdateSignedInRescueStationCommand(
				command.orgId,
				command.rescueStationData.rescueStationId,
				command.rescueStationData.strength,
				command.rescueStationData.note,
				command.rescueStationData.assignedUnitIds,
				command.rescueStationData.assignedAlertGroups,
			),
		);
		await this.eventBus.publish(
			new SignedInRescueStationUpdatedEvent(
				command.orgId,
				command.rescueStationData.rescueStationId,
			),
		);
	}
}
