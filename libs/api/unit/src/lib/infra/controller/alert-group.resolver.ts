import { QueryBus } from '@nestjs/cqrs';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import { AuthUser } from '@kordis/shared/model';

import { AlertGroupEntity } from '../../core/entity/alert-group.entity';
import { UnitEntity } from '../../core/entity/unit.entity';
import { GetAlertGroupsByIdQuery } from '../../core/query/get-alert-groups-by-id.query';
import { GetAlertGroupsByOrgQuery } from '../../core/query/get-alert-groups-by.org.query';
import { AlertGroupViewModel } from '../alert-group.view-model';

@Resolver()
export class AlertGroupResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@Query(() => [AlertGroupViewModel])
	alertGroups(
		@RequestUser() { organizationId }: AuthUser,
	): Promise<UnitEntity[]> {
		return this.queryBus.execute(new GetAlertGroupsByOrgQuery(organizationId));
	}

	@Query(() => AlertGroupViewModel)
	async alertGroup(
		@Args('id') id: string,
		@RequestUser() { organizationId }: AuthUser,
	): Promise<AlertGroupEntity[]> {
		return this.queryBus.execute(
			new GetAlertGroupsByIdQuery(organizationId, id),
		);
	}
}
