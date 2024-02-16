import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import {
	GraphQLSubscriptionService,
	PresentableNotFoundException,
} from '@kordis/api/shared';
import { expectIterableNotToHaveNext } from '@kordis/api/test-helpers';
import { AuthUser, Role } from '@kordis/shared/model';

import { CreateUserCommand } from '../../core/command/create-user.command';
import { DeactivateUserCommand } from '../../core/command/deactivate-user.command';
import { ReactivateUserCommand } from '../../core/command/reactivate-user.command';
import { UpdateEmailCommand } from '../../core/command/update-email.command';
import { UpdateRoleCommand } from '../../core/command/update-role.command';
import { UserEntity } from '../../core/entity/user.entity';
import { UserDeactivatedEvent } from '../../core/event/user-deactivated.event';
import { UserNotFoundException } from '../../core/exception/user-not-found.exception';
import { OrganizationUsersQuery } from '../../core/query/organization-users.query';
import { UserLoginHistoryQuery } from '../../core/query/user-login-history.query';
import { USER_SERVICE, UserService } from '../../core/service/user.service';
import { UserResolver } from './user.resolver';

describe('UserResolver', () => {
	let resolver: UserResolver;
	let mockCommandBus: DeepMocked<CommandBus>;
	let mockQueryBus: DeepMocked<QueryBus>;
	let eventBus: EventBus;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [
				UserResolver,
				GraphQLSubscriptionService,
				{ provide: USER_SERVICE, useValue: createMock<UserService>() },
			],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock<CommandBus>())
			.overrideProvider(QueryBus)
			.useValue(createMock<QueryBus>())
			.compile();

		resolver = module.get<UserResolver>(UserResolver);
		mockCommandBus = module.get<DeepMocked<CommandBus>>(CommandBus);
		mockQueryBus = module.get<DeepMocked<QueryBus>>(QueryBus);
		eventBus = module.get<EventBus>(EventBus);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('organizationUsers', () => {
		it('should return an array of users', async () => {
			const organizationId = 'organization-id';
			const mockUsers: UserEntity[] = [
				{
					id: '1',
					userName: 'user1',
					email: 'test@mail.com',
					organizationId,
					role: Role.USER,
					lastName: 'test',
					firstName: 'user 1',
					deactivated: false,
				},
				{
					id: '2',
					userName: 'user2',
					email: 'test2@mail.com',
					organizationId,
					role: Role.USER,
					lastName: 'test',
					firstName: 'user 2',
					deactivated: false,
				},
			];
			mockQueryBus.execute.mockResolvedValueOnce(mockUsers);

			const result = await resolver.users({
				organizationId,
			} as AuthUser);
			expect(mockQueryBus.execute).toHaveBeenCalledWith(
				new OrganizationUsersQuery(organizationId),
			);
			expect(result).toEqual(mockUsers);
		});
	});

	describe('userLoginHistory', () => {
		it('should return an array of timestamps', async () => {
			const mockDates: Date[] = [
				new Date('1689756688000'),
				new Date('1689725870000'),
				new Date('1689720476000'),
			];
			mockQueryBus.execute.mockResolvedValueOnce(mockDates);

			const result = await resolver.userLoginHistory(
				{
					organizationId: 'organization-id',
				} as AuthUser,
				'user-id',
				3,
			);

			expect(mockQueryBus.execute).toHaveBeenCalledWith(
				new UserLoginHistoryQuery('user-id', 3, 'organization-id'),
			);
			expect(result).toEqual(mockDates);
		});

		it('should throw presentable error for domain errors', async () => {
			mockQueryBus.execute.mockRejectedValueOnce(new UserNotFoundException());

			await expect(
				resolver.userLoginHistory(
					{
						organizationId: 'organization-id',
					} as AuthUser,
					'user-id',
					3,
				),
			).rejects.toThrow(
				new PresentableNotFoundException(
					'Der Benutzer konnte nicht gefunden werden.',
				),
			);
		});
	});

	describe('createUser', () => {
		it('should call create user command and return created user', async () => {
			const user: UserEntity = {
				id: '1',
				userName: 'user1',
				email: 'test@mail.com',
				organizationId: 'organization-id',
				role: Role.USER,
				lastName: 'test',
				firstName: 'user 1',
				deactivated: false,
			};

			mockCommandBus.execute.mockResolvedValueOnce(user);

			const result = await resolver.createUser(
				{
					organizationId: 'organization-id',
				} as AuthUser,
				{
					username: 'user1',
					email: 'test@mail.com',
					role: Role.USER,
					firstName: 'test',
					lastName: 'user 1',
				},
			);
			expect(mockCommandBus.execute).toHaveBeenCalledWith(
				new CreateUserCommand(
					'test',
					'user 1',
					'user1',
					'test@mail.com',
					Role.USER,
					'organization-id',
				),
			);
			expect(result).toEqual(user);
		});
	});

	describe('deactivateUser', () => {
		it('should call deactivate user command and return user', async () => {
			mockCommandBus.execute.mockResolvedValueOnce(undefined);

			const result = await resolver.deactivateUser(
				{
					organizationId: 'organization-id',
				} as AuthUser,
				'userid',
			);
			expect(mockCommandBus.execute).toHaveBeenCalledWith(
				new DeactivateUserCommand('userid', 'organization-id'),
			);
			expect(result).toBe(true);
		});

		it('should throw PresentableNotFoundException if UserNotFoundException is thrown', async () => {
			mockCommandBus.execute.mockRejectedValueOnce(new UserNotFoundException());
			await expect(
				resolver.deactivateUser(
					{
						organizationId: 'organization-id',
					} as AuthUser,
					'userid',
				),
			).rejects.toThrow(PresentableNotFoundException);
		});
	});

	describe('reactivateUser', () => {
		it('should call reactivate user command and return user', async () => {
			mockCommandBus.execute.mockResolvedValueOnce(undefined);

			const result = await resolver.reactivateUser(
				{
					organizationId: 'organization-id',
				} as AuthUser,
				'userid',
			);
			expect(mockCommandBus.execute).toHaveBeenCalledWith(
				new ReactivateUserCommand('userid', 'organization-id'),
			);
			expect(result).toBe(true);
		});

		it('should throw PresentableNotFoundException if UserNotFoundException is thrown', async () => {
			mockCommandBus.execute.mockRejectedValueOnce(new UserNotFoundException());
			await expect(
				resolver.reactivateUser(
					{
						organizationId: 'organization-id',
					} as AuthUser,
					'userid',
				),
			).rejects.toThrow(PresentableNotFoundException);
		});
	});

	describe('changeEmail', () => {
		it('should call change email command and return user', async () => {
			mockCommandBus.execute.mockResolvedValueOnce(undefined);

			const result = await resolver.changeEmail(
				{
					organizationId: 'organization-id',
					id: 'requestUserId',
					role: Role.ORGANIZATION_ADMIN,
				} as AuthUser,
				{ userId: 'userid', newEmail: 'test@mail.com' },
			);
			expect(mockCommandBus.execute).toHaveBeenCalledWith(
				new UpdateEmailCommand('userid', 'test@mail.com', 'organization-id'),
			);
			expect(result).toBe(true);
		});

		it('should throw UserNotFoundException if not org admin and not requesting user', async () => {
			await expect(
				resolver.changeEmail(
					{
						id: 'aDifferentUser',
						role: Role.USER,
					} as AuthUser,
					{ userId: 'attemptedUserIdToChange', newEmail: 'test@mail.com' },
				),
			).rejects.toThrow(PresentableNotFoundException);
		});

		it('should throw PresentableNotFoundException if UserNotFoundException is thrown', async () => {
			mockCommandBus.execute.mockRejectedValueOnce(new UserNotFoundException());
			await expect(
				resolver.changeEmail(
					{
						organizationId: 'organization-id',
						role: Role.ORGANIZATION_ADMIN,
					} as AuthUser,
					{ userId: 'userid', newEmail: 'test@mail.com' },
				),
			).rejects.toThrow(PresentableNotFoundException);
		});
	});

	describe('changeRole', () => {
		it('should call change role command and return user', async () => {
			mockCommandBus.execute.mockResolvedValueOnce(undefined);

			const result = await resolver.changeRole(
				{
					organizationId: 'organization-id',
				} as AuthUser,
				{ userId: 'userid', newRole: Role.ADMIN },
			);
			expect(mockCommandBus.execute).toHaveBeenCalledWith(
				new UpdateRoleCommand('userid', Role.ADMIN, 'organization-id'),
			);
			expect(result).toBe(true);
		});

		it('should throw PresentableNotFoundException if UserNotFoundException is thrown', async () => {
			mockCommandBus.execute.mockRejectedValueOnce(new UserNotFoundException());
			await expect(
				resolver.changeRole(
					{
						organizationId: 'organization-id',
					} as AuthUser,
					{ userId: 'userid', newRole: Role.ADMIN },
				),
			).rejects.toThrow(PresentableNotFoundException);
		});
	});

	describe('currentUserDeactivated', () => {
		it('should emit UserDeactivated if UserDeactivatedEvent fired', async () => {
			const subscriptionIterable = resolver.currentUserDeactivated({
				id: 'userid',
			} as AuthUser);
			eventBus.publish(new UserDeactivatedEvent('userid'));

			await expect(subscriptionIterable.next()).resolves.toEqual(
				expect.objectContaining({
					value: { userId: 'userid' },
				}),
			);
		});

		it('should not emit UserDeactivated if UserDeactivatedEvent fired for different user', async () => {
			const subscriptionIterable = resolver.currentUserDeactivated({
				id: 'userid',
			} as AuthUser);
			eventBus.publish(new UserDeactivatedEvent('some-different-user-id'));

			await expectIterableNotToHaveNext(subscriptionIterable);
		});
	});
});
