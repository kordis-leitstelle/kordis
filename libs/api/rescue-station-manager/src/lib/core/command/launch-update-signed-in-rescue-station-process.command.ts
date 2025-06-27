import {
	CommandBus,
	CommandHandler,
	EventBus,
	ICommandHandler,
} from '@nestjs/cqrs';

import { UpdateSignedInRescueStationCommand } from '@kordis/api/deployment';
import {
	CreateRescueStationUpdateMessageCommand,
	MessageUnit,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { SignedInRescueStationUpdatedEvent } from '../event/signed-in-rescue-station-updated.event';
import { CommandRescueStationData } from './command-rescue-station-data.model';
import { RescueStationMessageDetailsFactory } from './rescue-station-message-details-factory.service';

export class LaunchUpdateSignedInRescueStationProcessCommand {
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

@CommandHandler(LaunchUpdateSignedInRescueStationProcessCommand)
export class LaunchUpdateSignedInRescueStationProcessHandler
	implements ICommandHandler<LaunchUpdateSignedInRescueStationProcessCommand>
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
	}: LaunchUpdateSignedInRescueStationProcessCommand): Promise<void> {
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
			await this.rescueStationMessageDetailsFactory.createFromCommandRescueStationData(
				reqUser.organizationId,
				rescueStationData,
			);

		await this.commandBus.execute(
			new CreateRescueStationUpdateMessageCommand(
				new Date(),
				communicationMessageData,
				rsDetails,
				reqUser,
			),
		);
	}
}
