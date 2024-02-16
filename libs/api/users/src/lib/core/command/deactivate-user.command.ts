import { Inject } from '@nestjs/common';
import {
	CommandHandler,
	EventBus,
	ICommand,
	ICommandHandler,
} from '@nestjs/cqrs';

import { UserDeactivatedEvent } from '../event/user-deactivated.event';
import { USER_SERVICE, UserService } from '../service/user.service';

export class DeactivateUserCommand implements ICommand {
	constructor(
		readonly userId: string,
		readonly orgId: string,
	) {}
}

@CommandHandler(DeactivateUserCommand)
export class DeactivateUserHandler
	implements ICommandHandler<DeactivateUserCommand>
{
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
		private readonly eventBus: EventBus,
	) {}

	async execute({ userId, orgId }: DeactivateUserCommand): Promise<void> {
		await this.userService.deactivateUser(userId, orgId);
		this.eventBus.publish(new UserDeactivatedEvent(userId));
	}
}
