import { Role } from '@kordis/shared/auth';

import { User } from '../entity/user.entity';
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
	): Promise<User>;

	abstract changeEmail(userId: string, email: string): Promise<void>;

	abstract changeRole(userId: string, role: Role): Promise<void>;

	abstract deactivateUser(userId: string): Promise<void>;

	abstract getOrganizationUsers(orgId: string): Promise<User[]>;

	abstract getUser(id: string): Promise<User | null>;

	abstract reactivateUser(userId: string): Promise<void>;

	abstract getLoginHistory(id: string, amount: number): Promise<Date[]>;

	async assertOrgMembership(
		requestUserOrgId: string,
		userId: string,
	): Promise<void> {
		// if user is not in the organisation
		const user = await this.getUser(userId);
		if (!user || requestUserOrgId !== user.organizationId) {
			throw new UserNotFoundException();
		}
	}
}

export interface UserService {
	createUser(
		firstName: string,
		lastName: string,
		username: string,
		email: string,
		role: Role,
		orgId: string,
	): Promise<User>;

	changeEmail(userId: string, email: string): Promise<void>;

	deactivateUser(userId: string): Promise<void>;

	reactivateUser(userId: string): Promise<void>;

	changeRole(userId: string, role: Role): Promise<void>;

	getOrganizationUsers(orgId: string): Promise<User[]>;

	getUser(id: string): Promise<User | null>;

	getLoginHistory(id: string, amount: number): Promise<Date[]>;

	/*
	 * Checks if the user is modifying a user in its organization. Otherwise, throws an error.
	 */
	assertOrgMembership(requestUserOrgId: string, userId: string): Promise<void>;
}
