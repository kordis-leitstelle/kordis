import {
	CommandBus,
	CommandHandler,
	EventBus,
	ICommandHandler,
} from '@nestjs/cqrs';

import { SignInRescueStationCommand } from '@kordis/api/deployment';
import {
	CreateRescueStationSignOnMessageCommand,
	MessageUnit,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { RescueStationSignedOnEvent } from '../event/rescue-station-signed-on.event';
import { CommandRescueStationData } from './command-rescue-station-data.model';
import { RescueStationMessageDetailsFactory } from './rescue-station-message-details-factory.service';

export class LaunchSignOnProcessCommand {
	constructor(
		readonly reqUser: AuthUser,
		readonly rescueStationData: CommandRescueStationData,
		readonly communicationMessageData: {
			sender: MessageUnit;
			recipient: MessageUnit;
			channel: string;
		} | null,
	) {}
}

@CommandHandler(LaunchSignOnProcessCommand)
export class LaunchSignOnProcessHandler
	implements ICommandHandler<LaunchSignOnProcessCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
		private readonly rescueStationMessageDetailsFactory: RescueStationMessageDetailsFactory,
	) {}

	async execute({
		reqUser,
		rescueStationData,
		communicationMessageData,
	}: LaunchSignOnProcessCommand): Promise<void> {
		await this.commandBus.execute(
			new SignInRescueStationCommand(
				reqUser.organizationId,
				rescueStationData.rescueStationId,
				rescueStationData.strength,
				rescueStationData.note,
				rescueStationData.assignedUnitIds,
				rescueStationData.assignedAlertGroups,
			),
		);

		this.eventBus.publish(
			new RescueStationSignedOnEvent(
				reqUser.organizationId,
				rescueStationData.rescueStationId,
			),
		);

		const rsDetails =
			await this.rescueStationMessageDetailsFactory.createFromCommandRescueStationData(
				reqUser.organizationId,
				rescueStationData,
			);

		await this.commandBus.execute(
			new CreateRescueStationSignOnMessageCommand(
				new Date(),
				communicationMessageData,
				rsDetails,
				reqUser,
			),
		);
	}
}
