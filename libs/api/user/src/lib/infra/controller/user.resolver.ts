import { Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';

import { MinimumRole, RequestUser } from '@kordis/api/auth';
import {
	GraphQLSubscriptionService,
	PresentableNotFoundException,
} from '@kordis/api/shared';
import { AuthUser, Role } from '@kordis/shared/model';

import { CreateUserCommand } from '../../core/command/create-user.command';
import { DeactivateUserCommand } from '../../core/command/deactivate-user.command';
import { ReactivateUserCommand } from '../../core/command/reactivate-user.command';
import { UpdateEmailCommand } from '../../core/command/update-email.command';
import { UpdateRoleCommand } from '../../core/command/update-role.command';
import { UserDeactivatedEvent } from '../../core/event/user-deactivated.event';
import { UserNotFoundException } from '../../core/exception/user-not-found.exception';
import { OrganizationUsersQuery } from '../../core/query/organization-users.query';
import { UserLoginHistoryQuery } from '../../core/query/user-login-history.query';
import { USER_SERVICE, UserService } from '../../core/service/user.service';
import { UserViewModel } from '../user.view-model';
import { ChangeEmailArgs } from './argument/change-email.args';
import { ChangeRoleArgs } from './argument/change-role.args';
import { CreateUserArgs } from './argument/create-user.args';
import { UserDeactivated } from './object-type/user-deactivated.object-type';

@Resolver(UserViewModel)
export class UserResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly graphqlSubscriptions: GraphQLSubscriptionService,
		@Inject(USER_SERVICE) private readonly userService: UserService,
	) {}

	@MinimumRole(Role.ORGANIZATION_ADMIN)
	@Query(() => [UserViewModel])
	async users(
		@RequestUser() { organizationId }: AuthUser,
	): Promise<UserViewModel[]> {
		return this.queryBus.execute(new OrganizationUsersQuery(organizationId));
	}

	@MinimumRole(Role.ORGANIZATION_ADMIN)
	@Query(() => [String])
	async userLoginHistory(
		@RequestUser() reqUser: AuthUser,
		@Args('userId', { type: () => String }) userId: string,
		@Args('historyLength', { type: () => Number, defaultValue: 10 })
		historyLength = 10,
	): Promise<Date[]> {
		try {
			return await this.queryBus.execute(
				new UserLoginHistoryQuery(
					userId,
					historyLength,
					reqUser.organizationId,
				),
			);
		} catch (error) {
			this.throwPresentable(error);
		}
	}

	@MinimumRole(Role.ORGANIZATION_ADMIN)
	@Mutation(() => UserViewModel)
	async createUser(
		@RequestUser() { organizationId }: AuthUser,
		@Args() createUserArgs: CreateUserArgs,
	): Promise<UserViewModel> {
		return this.commandBus.execute(
			new CreateUserCommand(
				createUserArgs.firstName,
				createUserArgs.lastName,
				createUserArgs.username,
				createUserArgs.email,
				createUserArgs.role,
				organizationId,
			),
		);
	}

	@MinimumRole(Role.ORGANIZATION_ADMIN)
	@Mutation(() => Boolean)
	async deactivateUser(
		@RequestUser() reqUser: AuthUser,
		@Args('userId', { type: () => String }) userId: string,
	): Promise<boolean> {
		try {
			await this.commandBus.execute(
				new DeactivateUserCommand(userId, reqUser.organizationId),
			);
		} catch (error) {
			this.throwPresentable(error);
		}

		return true;
	}

	@MinimumRole(Role.ORGANIZATION_ADMIN)
	@Mutation(() => Boolean)
	async reactivateUser(
		@RequestUser() reqUser: AuthUser,
		@Args('userId', { type: () => String }) userId: string,
	): Promise<boolean> {
		try {
			await this.commandBus.execute(
				new ReactivateUserCommand(userId, reqUser.organizationId),
			);
		} catch (error) {
			this.throwPresentable(error);
		}

		return true;
	}

	@Mutation(() => Boolean)
	async changeEmail(
		@RequestUser() reqUser: AuthUser,
		@Args() { userId, newEmail }: ChangeEmailArgs,
	): Promise<boolean> {
		// Only organization admins can change other users' email
		if (reqUser.role !== Role.ORGANIZATION_ADMIN && userId !== reqUser.id) {
			this.throwPresentable(new UserNotFoundException());
		}
		try {
			await this.commandBus.execute(
				new UpdateEmailCommand(userId, newEmail, reqUser.organizationId),
			);
		} catch (error) {
			this.throwPresentable(error);
		}

		return true;
	}

	@MinimumRole(Role.ORGANIZATION_ADMIN)
	@Mutation(() => Boolean)
	async changeRole(
		@RequestUser() reqUser: AuthUser,
		@Args() { userId, newRole }: ChangeRoleArgs,
	): Promise<boolean> {
		try {
			await this.commandBus.execute(
				new UpdateRoleCommand(userId, newRole, reqUser.organizationId),
			);
		} catch (error) {
			this.throwPresentable(error);
		}

		return true;
	}

	@Subscription(() => UserDeactivated, {
		resolve: (payload) => payload,
	})
	currentUserDeactivated(
		@RequestUser() { id }: AuthUser,
	): AsyncIterableIterator<UserDeactivated> {
		return this.graphqlSubscriptions.getSubscriptionIteratorForEvent(
			UserDeactivatedEvent,
			{
				filter: ({ userId }: UserDeactivatedEvent) => userId === id,
			},
		);
	}

	private throwPresentable(error: unknown): never {
		if (error instanceof UserNotFoundException) {
			throw new PresentableNotFoundException(
				'Der Benutzer konnte nicht gefunden werden.',
			);
		}

		throw error;
	}
}
