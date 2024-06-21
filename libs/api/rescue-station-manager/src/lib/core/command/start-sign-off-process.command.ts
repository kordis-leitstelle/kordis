import {
	CommandBus,
	CommandHandler,
	EventBus,
	ICommandHandler,
	QueryBus,
} from '@nestjs/cqrs';

import {
	GetRescueStationDeploymentQuery,
	RescueStationDeploymentViewModel,
	SignOffRescueStationCommand,
} from '@kordis/api/deployment';
import {
	CreateRescueStationSignOffMessageCommand,
	MessageUnit,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { RescueStationSignedOffEvent } from '../event/rescue-station-signed-off.event';

export class StartSignOffProcessCommand {
	constructor(
		readonly reqUser: AuthUser,
		readonly rescueStationId: string,
		readonly communicationMessageData: {
			sender: MessageUnit;
			recipient: MessageUnit;
			channel: string;
		},
	) {}
}

@CommandHandler(StartSignOffProcessCommand)
export class StartSignOffProcessHandler
	implements ICommandHandler<StartSignOffProcessCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly eventBus: EventBus,
	) {}

	async execute(cmd: StartSignOffProcessCommand): Promise<void> {
		await this.commandBus.execute(
			new SignOffRescueStationCommand(
				cmd.reqUser.organizationId,
				cmd.rescueStationId,
			),
		);

		this.eventBus.publish(
			new RescueStationSignedOffEvent(
				cmd.reqUser.organizationId,
				cmd.rescueStationId,
			),
		);

		await this.executeMessageCommand(cmd);
	}

	private async executeMessageCommand(
		cmd: StartSignOffProcessCommand,
	): Promise<void> {
		const rs: RescueStationDeploymentViewModel = await this.queryBus.execute(
			new GetRescueStationDeploymentQuery(
				cmd.reqUser.organizationId,
				cmd.rescueStationId,
			),
		);
		await this.commandBus.execute(
			new CreateRescueStationSignOffMessageCommand(
				new Date(),
				cmd.communicationMessageData.sender,
				cmd.communicationMessageData.recipient,
				{
					id: rs.id,
					name: rs.name,
					callSign: rs.callSign,
				},
				cmd.communicationMessageData.channel,
				cmd.reqUser,
			),
		);
	}
}
