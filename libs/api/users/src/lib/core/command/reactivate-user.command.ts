import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { User } from '../entity/user.entity';
import { USER_SERVICE, UserService } from '../service/user.service';

export class ReactivateUserCommand implements ICommand {
	constructor(
		readonly userId: string,
		readonly requestUserOrgId: string,
	) {}
}

@CommandHandler(ReactivateUserCommand)
export class ReactivateUserHandler
	implements ICommandHandler<ReactivateUserCommand>
{
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
	) {}

	async execute({
		userId,
		requestUserOrgId,
	}: ReactivateUserCommand): Promise<User | null> {
		await this.userService.assertOrgMembership(requestUserOrgId, userId);
		await this.userService.reactivateUser(userId);

		return this.userService.getUser(userId);
	}
}
