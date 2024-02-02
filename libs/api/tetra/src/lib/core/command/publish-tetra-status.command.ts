import {
	CommandHandler,
	EventBus,
	ICommand,
	ICommandHandler,
} from '@nestjs/cqrs';

import { NewTetraStatusEvent } from '../event/new-tetra-status.event';

export class PublishTetraStatusCommand implements ICommand {
	constructor(
		readonly sendingIssi: string,
		readonly fmsStatus: number,
		readonly sentAt: Date,
	) {}
}

@CommandHandler(PublishTetraStatusCommand)
export class PublishTetraStatusHandler
	implements ICommandHandler<PublishTetraStatusCommand>
{
	constructor(private readonly eventBus: EventBus) {}

	async execute(command: PublishTetraStatusCommand): Promise<void> {
		this.eventBus.publish(
			new NewTetraStatusEvent(
				command.sendingIssi,
				command.fmsStatus,
				command.sentAt,
			),
		);
	}
}
