import { Inject } from '@nestjs/common';
import {
	CommandHandler,
	EventBus,
	ICommand,
	ICommandHandler,
} from '@nestjs/cqrs';

import { User } from '../entity/user.entity';
import { UserDeactivatedEvent } from '../event/user-deactivated.event';
import { USER_SERVICE, UserService } from '../service/user.service';

export class DeactivateUserCommand implements ICommand {
	constructor(readonly userId: string, readonly requestUserOrgId: string) {}
}

@CommandHandler(DeactivateUserCommand)
export class DeactivateUserHandler
	implements ICommandHandler<DeactivateUserCommand>
{
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
		private readonly eventBus: EventBus,
	) {}

	async execute({
		userId,
		requestUserOrgId,
	}: DeactivateUserCommand): Promise<User | null> {
		await this.userService.assertOrgMembership(requestUserOrgId, userId);

		await this.userService.deactivateUser(userId);
		this.eventBus.publish(new UserDeactivatedEvent(userId));

		return this.userService.getUser(userId);
	}
}
