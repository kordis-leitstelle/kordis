import { Inject } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

import { Role } from '@kordis/shared/model';

import { UserEntity } from '../entity/user.entity';
import { USER_SERVICE, UserService } from '../service/user.service';

export class CreateUserCommand implements ICommand {
	constructor(
		readonly firstName: string,
		readonly lastName: string,
		readonly username: string,
		readonly email: string,
		readonly role: Role,
		readonly orgId: string,
	) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
	) {}

	async execute(command: CreateUserCommand): Promise<UserEntity> {
		return this.userService.createUser(
			command.firstName,
			command.lastName,
			command.username,
			command.email,
			command.role,
			command.orgId,
		);
	}
}
