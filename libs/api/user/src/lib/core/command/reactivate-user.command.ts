import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { USER_SERVICE, UserService } from '../service/user.service';

export class ReactivateUserCommand implements ICommand {
	constructor(
		readonly userId: string,
		readonly orgId: string,
	) {}
}

@CommandHandler(ReactivateUserCommand)
export class ReactivateUserHandler
	implements ICommandHandler<ReactivateUserCommand>
{
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
	) {}

	async execute({ userId, orgId }: ReactivateUserCommand): Promise<void> {
		await this.userService.reactivateUser(orgId, userId);
	}
}
