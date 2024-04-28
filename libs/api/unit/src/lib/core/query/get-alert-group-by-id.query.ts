import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AlertGroupEntity } from '../entity/alert-group.entity';
import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';

export class GetAlertGroupByIdQuery {
	constructor(
		readonly orgId: string,
		readonly id: string,
	) {}
}

@QueryHandler(GetAlertGroupByIdQuery)
export class GetAlertGroupByIdHandler
	implements IQueryHandler<GetAlertGroupByIdQuery>
{
	constructor(
		@Inject(ALERT_GROUP_REPOSITORY)
		private readonly repository: AlertGroupRepository,
	) {}

	async execute({
		orgId,
		id,
	}: GetAlertGroupByIdQuery): Promise<AlertGroupEntity> {
		return this.repository.findById(orgId, id);
	}
}
