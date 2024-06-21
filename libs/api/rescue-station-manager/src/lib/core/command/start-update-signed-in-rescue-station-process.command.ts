import {
	CommandBus,
	CommandHandler,
	EventBus,
	ICommandHandler,
} from '@nestjs/cqrs';

import { UpdateSignedInRescueStationCommand } from '@kordis/api/deployment';
import {
	CreateRescueStationSignOnMessageCommand,
	MessageUnit,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { SignedInRescueStationUpdatedEvent } from '../event/signed-in-rescue-station-updated.event';
import { CommandRescueStationData } from './command-rescue-station-data.model';
import { MessageCommandRescueStationDetailsFactory } from './message-command-rescue-station-details.factory';

export class StartUpdateSignedInRescueStationProcessCommand {
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

@CommandHandler(StartUpdateSignedInRescueStationProcessCommand)
export class StartUpdateSignedInRescueStationProcessHandler
	implements ICommandHandler<StartUpdateSignedInRescueStationProcessCommand>
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
	}: StartUpdateSignedInRescueStationProcessCommand): Promise<void> {
		await this.commandBus.execute(
			new UpdateSignedInRescueStationCommand(
				reqUser.organizationId,
				rescueStationData.rescueStationId,
				rescueStationData.strength,
				rescueStationData.note,
				rescueStationData.assignedUnitIds,
				rescueStationData.assignedAlertGroups,
			),
		);
		await this.eventBus.publish(
			new SignedInRescueStationUpdatedEvent(
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
