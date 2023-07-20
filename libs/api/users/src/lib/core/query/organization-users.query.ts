import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { User } from '../entity/user.entity';
import { USER_SERVICE, UserService } from '../service/user.service';

export class OrganizationUsersQuery {
	constructor(readonly orgId: string) {}
}

@QueryHandler(OrganizationUsersQuery)
export class OrganizationUsersHandler
	implements IQueryHandler<OrganizationUsersQuery>
{
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
	) {}

	async execute(query: OrganizationUsersQuery): Promise<User[]> {
		return this.userService.getOrganizationUsers(query.orgId);
	}
}
