import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Role } from '@kordis/shared/auth';
import { TEST_USERS } from '@kordis/shared/test-helpers';

import { UserEntity } from '../../core/entity/user.entity';
import { UserNotFoundException } from '../../core/exception/user-not-found.exception';
import { BaseUserService } from '../../core/service/user.service';

/*
 * This is a mock implementation of the UserService interface with an InMemory store only used for dev scenarios, where no concrete AuthStore (such as Azure AD B2C is available).
 */
@Injectable()
export class DevUserService extends BaseUserService {
	private readonly users: UserEntity[] = [...structuredClone(TEST_USERS)];

	updateEmail(orgId: string, userId: string, email: string): Promise<void> {
		const user = this.users.find(
			(u) => u.id === userId && u.organizationId === orgId,
		);
		if (user) {
			user.email = email;
		}
		return Promise.resolve();
	}

	createUser(
		firstName: string,
		lastName: string,
		userName: string,
		email: string,
		role: Role,
		organizationId: string,
	): Promise<UserEntity> {
		const user: UserEntity = {
			deactivated: false,
			id: randomUUID(),
			email,
			firstName,
			lastName,
			organizationId,
			role,
			userName,
		};

		this.users.push(user);

		return Promise.resolve(user);
	}

	deactivateUser(orgId: string, userId: string): Promise<void> {
		const user = this.users.find(
			(u) => u.id === userId && u.organizationId === orgId,
		);
		if (user) {
			user.deactivated = true;
		}
		return Promise.resolve();
	}

	reactivateUser(orgId: string, userId: string): Promise<void> {
		const user = this.users.find(
			(u) => u.id === userId && u.organizationId === orgId,
		);
		if (user) {
			user.deactivated = false;
		}
		return Promise.resolve();
	}

	updateRole(orgId: string, userId: string, role: Role): Promise<void> {
		const user = this.users.find(
			(u) => u.id === userId && u.organizationId === orgId,
		);
		if (user) {
			user.role = role;
		}
		return Promise.resolve();
	}

	getOrganizationUsers(orgId: string): Promise<UserEntity[]> {
		return Promise.resolve(
			this.users.filter((u) => u.organizationId === orgId),
		);
	}

	getUser(orgId: string, id: string): Promise<UserEntity> {
		const user = this.users.find(
			(u) => u.id === id && u.organizationId === orgId,
		);
		if (user) {
			return Promise.resolve(user);
		} else {
			throw new UserNotFoundException();
		}
	}

	getLoginHistory(): Promise<Date[]> {
		return Promise.resolve([]);
	}

	protected getUserById(id: string): Promise<UserEntity | null> {
		return Promise.resolve(this.users.find((u) => u.id === id) ?? null);
	}
}
