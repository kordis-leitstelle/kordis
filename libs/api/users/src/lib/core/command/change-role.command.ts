import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { User } from '@sentry/node';

import { Role } from '@kordis/shared/auth';

import { USER_SERVICE, UserService } from '../service/user.service';

export class ChangeRoleCommand implements ICommand {
	constructor(
		readonly userId: string,
		readonly newRole: Role,
		readonly requestUserOrgId: string,
	) {}
}

@CommandHandler(ChangeRoleCommand)
export class ChangeRoleHandler implements ICommandHandler<ChangeRoleCommand> {
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
	) {}

	async execute({
		userId,
		newRole,
		requestUserOrgId,
	}: ChangeRoleCommand): Promise<User | null> {
		await this.userService.assertOrgMembership(requestUserOrgId, userId);

		await this.userService.changeRole(userId, newRole);
		return this.userService.getUser(userId);
	}
}
