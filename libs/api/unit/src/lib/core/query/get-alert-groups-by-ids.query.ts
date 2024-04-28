import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AlertGroupEntity } from '../entity/alert-group.entity';
import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';

export class GetAlertGroupsByIdsQuery {
	constructor(readonly ids: string[]) {}
}

@QueryHandler(GetAlertGroupsByIdsQuery)
export class GetAlertGroupsByIdsHandler
	implements IQueryHandler<GetAlertGroupsByIdsQuery>
{
	constructor(
		@Inject(ALERT_GROUP_REPOSITORY)
		private readonly repository: AlertGroupRepository,
	) {}

	async execute({
		ids,
	}: GetAlertGroupsByIdsQuery): Promise<AlertGroupEntity[]> {
		return this.repository.findByIds(ids);
	}
}
