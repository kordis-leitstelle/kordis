import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { User } from '@sentry/node';

import { Role } from '@kordis/shared/auth';

import { InsufficientPermissionException } from '../exception/insufficient-permission.exception';
import { USER_SERVICE, UserService } from '../service/user.service';

export class ChangeEmailCommand implements ICommand {
	constructor(
		readonly userId: string,
		readonly newEmail: string,
		readonly requestUserId: string,
		readonly requestUserRole: Role,
		readonly requestUserOrgId: string,
	) {}
}

@CommandHandler(ChangeEmailCommand)
export class ChangeEmailHandler implements ICommandHandler<ChangeEmailCommand> {
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
	) {}

	async execute({
		userId,
		newEmail,
		requestUserId,
		requestUserRole,
		requestUserOrgId,
	}: ChangeEmailCommand): Promise<User | null> {
		if (requestUserRole === Role.ORGANIZATION_ADMIN) {
			await this.userService.assertOrgMembership(requestUserOrgId, userId);
		} else if (requestUserId !== userId) {
			throw new InsufficientPermissionException();
		}

		await this.userService.changeEmail(userId, newEmail);
		return this.userService.getUser(userId);
	}
}
