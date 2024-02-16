import { Role } from '@kordis/shared/model';

import { UserEntity } from '../entity/user.entity';
import { UserNotFoundException } from '../exception/user-not-found.exception';

export const USER_SERVICE = Symbol('USER_SERVICE');

export abstract class BaseUserService implements UserService {
	abstract createUser(
		firstName: string,
		lastName: string,
		username: string,
		email: string,
		role: Role,
		orgId: string,
	): Promise<UserEntity>;

	abstract updateEmail(
		orgId: string,
		userId: string,
		email: string,
	): Promise<void>;

	abstract deactivateUser(orgId: string, userId: string): Promise<void>;

	abstract reactivateUser(orgId: string, userId: string): Promise<void>;

	abstract updateRole(orgId: string, userId: string, role: Role): Promise<void>;

	abstract getOrganizationUsers(orgId: string): Promise<UserEntity[]>;

	abstract getUser(orgId: string, id: string): Promise<UserEntity | null>;

	abstract getLoginHistory(
		orgId: string,
		id: string,
		amount: number,
	): Promise<Date[]>;

	protected async assertOrgMembership(
		orgId: string,
		userId: string,
	): Promise<void> {
		// if user is not in the organisation
		const user = await this.getUserById(userId);
		if (!user || orgId !== user.organizationId) {
			throw new UserNotFoundException();
		}
	}

	protected abstract getUserById(id: string): Promise<UserEntity | null>;
}

export interface UserService {
	createUser(
		firstName: string,
		lastName: string,
		username: string,
		email: string,
		role: Role,
		orgId: string,
	): Promise<UserEntity>;

	updateEmail(orgId: string, userId: string, email: string): Promise<void>;

	deactivateUser(orgId: string, userId: string): Promise<void>;

	reactivateUser(orgId: string, userId: string): Promise<void>;

	updateRole(orgId: string, userId: string, role: Role): Promise<void>;

	getOrganizationUsers(orgId: string): Promise<UserEntity[]>;

	getUser(orgId: string, id: string): Promise<UserEntity | null>;

	getLoginHistory(orgId: string, id: string, amount: number): Promise<Date[]>;
}
