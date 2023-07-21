import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Role } from '@kordis/shared/auth';
import { TEST_USERS } from '@kordis/shared/test-helpers';

import { User } from '../../core/entity/user.entity';
import { BaseUserService } from '../../core/service/user.service';

/*
 * This is a mock implementation of the UserService interface with an InMemory store only used for dev scenarios, where no concrete AuthStore (such as Azure AD B2C is available).
 */
@Injectable()
export class DevUserService extends BaseUserService {
	private readonly users: User[] = [...TEST_USERS];

	changeEmail(userId: string, email: string): Promise<void> {
		const user = this.users.find((u) => u.id === userId);
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
	): Promise<User> {
		const user: User = {
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

	deactivateUser(userId: string): Promise<void> {
		const user = this.users.find((u) => u.id === userId);
		if (user) {
			user.deactivated = true;
		}
		return Promise.resolve();
	}

	reactivateUser(userId: string): Promise<void> {
		const user = this.users.find((u) => u.id === userId);
		if (user) {
			user.deactivated = false;
		}
		return Promise.resolve();
	}

	changeRole(userId: string, role: Role): Promise<void> {
		const user = this.users.find((u) => u.id === userId);
		if (user) {
			user.role = role;
		}
		return Promise.resolve();
	}

	getOrganizationUsers(orgId: string): Promise<User[]> {
		return Promise.resolve(
			this.users.filter((u) => u.organizationId === orgId),
		);
	}

	getUser(id: string): Promise<User | null> {
		return Promise.resolve(this.users.find((u) => u.id === id) ?? null);
	}

	getLoginHistory(): Promise<Date[]> {
		return Promise.resolve([]);
	}
}
