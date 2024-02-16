import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { USER_SERVICE, UserService } from '../service/user.service';

export class UpdateEmailCommand implements ICommand {
	constructor(
		readonly userId: string,
		readonly newEmail: string,
		readonly orgId: string,
	) {}
}

@CommandHandler(UpdateEmailCommand)
export class UpdateEmailHandler implements ICommandHandler<UpdateEmailCommand> {
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
	) {}

	async execute({
		userId,
		newEmail,
		orgId,
	}: UpdateEmailCommand): Promise<void> {
		await this.userService.updateEmail(orgId, userId, newEmail);
	}
}
