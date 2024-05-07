import {
	CommandBus,
	CommandHandler,
	EventBus,
	ICommandHandler,
} from '@nestjs/cqrs';

import { SignInRescueStationCommand } from '@kordis/api/deployment';

import { RescueStationSignedInEvent } from '../event/rescue-station-signed-in.event';

export class StartSignInProcessCommand {
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

@CommandHandler(StartSignInProcessCommand)
export class StartSignInProcessHandler
	implements ICommandHandler<StartSignInProcessCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: StartSignInProcessCommand): Promise<void> {
		await this.commandBus.execute(
			new SignInRescueStationCommand(
				command.orgId,
				command.rescueStationData.rescueStationId,
				command.rescueStationData.strength,
				command.rescueStationData.note,
				command.rescueStationData.assignedUnitIds,
				command.rescueStationData.assignedAlertGroups,
			),
		);

		this.eventBus.publish(
			new RescueStationSignedInEvent(
				command.orgId,
				command.rescueStationData.rescueStationId,
			),
		);
	}
}
