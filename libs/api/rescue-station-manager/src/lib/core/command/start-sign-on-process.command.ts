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
import { MessageCommandRescueStationDetailsFactory } from './message-command-rescue-station-details.factory';

export class StartSignOnProcessCommand {
	constructor(
		readonly reqUser: AuthUser,
		readonly rescueStationData: CommandRescueStationData,
		readonly communicationMessageData: {
			sender: MessageUnit;
			recipient: MessageUnit;
			channel: string;
		},
	) {}
}

@CommandHandler(StartSignOnProcessCommand)
export class StartSignOnProcessHandler
	implements ICommandHandler<StartSignOnProcessCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
		private readonly messageCommandRescueStationDetailsFactory: MessageCommandRescueStationDetailsFactory,
	) {}

	async execute({
		reqUser,
		rescueStationData,
		communicationMessageData,
	}: StartSignOnProcessCommand): Promise<void> {
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
			await this.messageCommandRescueStationDetailsFactory.createFromCommandRescueStationData(
				reqUser.organizationId,
				rescueStationData,
			);

		await this.commandBus.execute(
			new CreateRescueStationSignOnMessageCommand(
				new Date(),
				communicationMessageData.sender,
				communicationMessageData.recipient,
				rsDetails,
				communicationMessageData.channel,
				reqUser,
			),
		);
	}
}
