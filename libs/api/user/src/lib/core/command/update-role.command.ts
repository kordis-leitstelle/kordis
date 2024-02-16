import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { Role } from '@kordis/shared/auth';

import { USER_SERVICE, UserService } from '../service/user.service';

export class UpdateRoleCommand implements ICommand {
	constructor(
		readonly userId: string,
		readonly newRole: Role,
		readonly orgId: string,
	) {}
}

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand> {
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
	) {}

	async execute({ userId, newRole, orgId }: UpdateRoleCommand): Promise<void> {
		await this.userService.updateRole(orgId, userId, newRole);
	}
}
