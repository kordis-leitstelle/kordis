import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { USER_SERVICE, UserService } from '../service/user.service';

export class UserLoginHistoryQuery {
	constructor(
		readonly userId: string,
		readonly historyLength: number,
		readonly orgId: string,
	) {}
}

@QueryHandler(UserLoginHistoryQuery)
export class UserLoginHistoryHandler
	implements IQueryHandler<UserLoginHistoryQuery>
{
	constructor(
		@Inject(USER_SERVICE) private readonly userService: UserService,
	) {}

	async execute({
		userId,
		orgId,
		historyLength,
	}: UserLoginHistoryQuery): Promise<Date[]> {
		return this.userService.getLoginHistory(orgId, userId, historyLength);
	}
}
