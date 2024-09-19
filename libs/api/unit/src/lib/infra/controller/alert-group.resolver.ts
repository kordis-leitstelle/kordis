import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
	Args,
	Field,
	ID,
	InputType,
	Mutation,
	Query,
	Resolver,
} from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import { AuthUser } from '@kordis/shared/model';

import { ResetAlertGroupUnitsCommand } from '../../core/command/reset-alert-group-units.command';
import { UpdateCurrentAlertGroupUnitsCommand } from '../../core/command/update-current-alert-group-units.command';
import { AlertGroupEntity } from '../../core/entity/alert-group.entity';
import { UnitEntity } from '../../core/entity/unit.entity';
import { GetAlertGroupByIdQuery } from '../../core/query/get-alert-group-by-id.query';
import { GetAlertGroupsByIdsQuery } from '../../core/query/get-alert-groups-by-ids.query';
import { GetAlertGroupsByOrgQuery } from '../../core/query/get-alert-groups-by.org.query';
import { AlertGroupViewModel } from '../alert-group.view-model';

@InputType()
export class AlertGroupsFilter {
	@Field(() => [ID], { nullable: true })
	ids?: string[];
}

@Resolver()
export class AlertGroupResolver {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly commandBus: CommandBus,
	) {}

	@Query(() => [AlertGroupViewModel])
	alertGroups(
		@RequestUser() { organizationId }: AuthUser,
		@Args('filter', { nullable: true, type: () => AlertGroupsFilter })
		filter?: AlertGroupsFilter,
	): Promise<UnitEntity[]> {
		if (filter?.ids) {
			return this.queryBus.execute(
				new GetAlertGroupsByIdsQuery(filter.ids, organizationId),
			);
		}
		return this.queryBus.execute(new GetAlertGroupsByOrgQuery(organizationId));
	}

	@Query(() => AlertGroupViewModel)
	async alertGroup(
		@Args('id', { type: () => ID }) id: string,
		@RequestUser() { organizationId }: AuthUser,
	): Promise<AlertGroupEntity[]> {
		return this.queryBus.execute(
			new GetAlertGroupByIdQuery(organizationId, id),
		);
	}

	@Mutation(() => AlertGroupViewModel)
	async setCurrentAlertGroupUnits(
		@Args('alertGroupId', { type: () => ID }) alertGroupId: string,
		@Args('unitIds', { type: () => [ID] }) unitIds: string[],
		@RequestUser() { organizationId }: AuthUser,
	): Promise<AlertGroupEntity> {
		await this.commandBus.execute(
			new UpdateCurrentAlertGroupUnitsCommand(
				organizationId,
				alertGroupId,
				unitIds,
			),
		);

		return this.queryBus.execute(
			new GetAlertGroupByIdQuery(organizationId, alertGroupId),
		);
	}

	@Mutation(() => [AlertGroupViewModel])
	async resetCurrentAlertGroupUnits(
		@RequestUser() { organizationId }: AuthUser,
	): Promise<AlertGroupEntity[]> {
		await this.commandBus.execute(
			new ResetAlertGroupUnitsCommand(organizationId),
		);

		return this.queryBus.execute(new GetAlertGroupsByOrgQuery(organizationId));
	}
}
