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

export class LaunchSignOffProcessCommand {
	constructor(
		readonly reqUser: AuthUser,
		readonly rescueStationId: string,
		readonly communicationMessageData: {
			sender: MessageUnit;
			recipient: MessageUnit;
			channel: string;
		} | null,
	) {}
}

@CommandHandler(LaunchSignOffProcessCommand)
export class LaunchSignOffProcessHandler
	implements ICommandHandler<LaunchSignOffProcessCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly eventBus: EventBus,
	) {}

	async execute(cmd: LaunchSignOffProcessCommand): Promise<void> {
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

		const rs: RescueStationDeploymentViewModel = await this.queryBus.execute(
			new GetRescueStationDeploymentQuery(
				cmd.reqUser.organizationId,
				cmd.rescueStationId,
			),
		);
		await this.commandBus.execute(
			new CreateRescueStationSignOffMessageCommand(
				new Date(),
				cmd.communicationMessageData,
				{
					id: rs.id,
					name: rs.name,
					callSign: rs.callSign,
				},
				cmd.reqUser,
			),
		);
	}
}
