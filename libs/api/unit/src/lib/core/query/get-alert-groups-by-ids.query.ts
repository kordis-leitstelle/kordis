import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RetainOrderOptions, RetainOrderService } from '@kordis/api/shared';

import { AlertGroupEntity } from '../entity/alert-group.entity';
import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';

export class GetAlertGroupsByIdsQuery {
	constructor(
		readonly ids: string[],
		readonly options: RetainOrderOptions = { retainOrder: false },
	) {}
}

@QueryHandler(GetAlertGroupsByIdsQuery)
export class GetAlertGroupsByIdsHandler
	implements IQueryHandler<GetAlertGroupsByIdsQuery>
{
	constructor(
		@Inject(ALERT_GROUP_REPOSITORY)
		private readonly repository: AlertGroupRepository,
		private readonly mutator: RetainOrderService,
	) {}

	async execute({
		ids,
		options,
	}: GetAlertGroupsByIdsQuery): Promise<AlertGroupEntity[]> {
		let alertGroups = await this.repository.findByIds(ids);

		alertGroups = this.mutator.retainOrderIfEnabled(options, ids, alertGroups);

		return alertGroups;
	}
}
