import {
	CommandBus,
	CommandHandler,
	EventBus,
	ICommandHandler,
} from '@nestjs/cqrs';

import { SignOffRescueStationCommand } from '@kordis/api/deployment';

import { RescueStationSignedOffEvent } from '../event/rescue-station-signed-off.event';

export class StartSignOffProcessCommand {
	constructor(
		readonly orgId: string,
		readonly rescueStationId: string,
	) {}
}

@CommandHandler(StartSignOffProcessCommand)
export class StartSignOffProcessHandler
	implements ICommandHandler<StartSignOffProcessCommand>
{
	constructor(
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		orgId,
		rescueStationId,
	}: StartSignOffProcessCommand): Promise<void> {
		await this.commandBus.execute(
			new SignOffRescueStationCommand(orgId, rescueStationId),
		);
		this.eventBus.publish(
			new RescueStationSignedOffEvent(orgId, rescueStationId),
		);
	}
}
