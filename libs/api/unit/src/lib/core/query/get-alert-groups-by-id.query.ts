import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AlertGroupEntity } from '../entity/alert-group.entity';
import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';

export class GetAlertGroupsByIdQuery {
	constructor(
		readonly orgId: string,
		readonly id: string,
	) {}
}

@QueryHandler(GetAlertGroupsByIdQuery)
export class GetAlertGroupsByIdHandler
	implements IQueryHandler<GetAlertGroupsByIdQuery>
{
	constructor(
		@Inject(ALERT_GROUP_REPOSITORY)
		private readonly repository: AlertGroupRepository,
	) {}

	async execute({
		orgId,
		id,
	}: GetAlertGroupsByIdQuery): Promise<AlertGroupEntity> {
		return this.repository.findById(orgId, id);
	}
}
