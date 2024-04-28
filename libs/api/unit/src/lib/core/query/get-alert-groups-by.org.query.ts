import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AlertGroupEntity } from '../entity/alert-group.entity';
import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';

export class GetAlertGroupsByOrgQuery {
	constructor(readonly orgId: string) {}
}

@QueryHandler(GetAlertGroupsByOrgQuery)
export class GetAlertGroupsByOrgHandler
	implements IQueryHandler<GetAlertGroupsByOrgQuery>
{
	constructor(
		@Inject(ALERT_GROUP_REPOSITORY)
		private readonly repository: AlertGroupRepository,
	) {}

	async execute({
		orgId,
	}: GetAlertGroupsByOrgQuery): Promise<AlertGroupEntity[]> {
		return this.repository.findByOrgId(orgId);
	}
}
