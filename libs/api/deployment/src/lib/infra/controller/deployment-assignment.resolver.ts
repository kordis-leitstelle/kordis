import { QueryBus } from '@nestjs/cqrs';
import {
	ObjectType,
	OmitType,
	Parent,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import { AlertGroupViewModel, UnitViewModel } from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import { GetAlertGroupByUnitIdQuery } from '../../core/query/get-alert-group-by-unit-id.query';
import { GetCurrentAssignmentOfEntity } from '../../core/query/get-current-assignment-of-entity.query';
import { RescueStationDeploymentViewModel } from '../rescue-station.view-model';

@ObjectType()
export class EntityRescueStationAssignment extends OmitType(
	RescueStationDeploymentViewModel,
	['assignments', 'assignedAlertGroups', 'assignedUnits'] as const,
) {}

@Resolver(() => UnitViewModel)
export class UnitAssignmentResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@ResolveField(() => EntityRescueStationAssignment, { nullable: true })
	async assignment(
		@RequestUser() { organizationId }: AuthUser,
		@Parent() unit: UnitViewModel,
	): Promise<EntityRescueStationAssignment | null> {
		return this.queryBus.execute(
			new GetCurrentAssignmentOfEntity(organizationId, unit.id),
		);
	}

	@ResolveField(() => AlertGroupViewModel, { nullable: true })
	alertGroup(
		@RequestUser() { organizationId }: AuthUser,
		@Parent() unit: UnitViewModel,
	): Promise<AlertGroupViewModel> {
		return this.queryBus.execute(
			new GetAlertGroupByUnitIdQuery(organizationId, unit.id),
		);
	}
}

@Resolver(() => AlertGroupViewModel)
export class AlertGroupAssignmentResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@ResolveField(() => EntityRescueStationAssignment, { nullable: true })
	assignment(
		@RequestUser() { organizationId }: AuthUser,
		@Parent() alertGroup: AlertGroupViewModel,
	): Promise<EntityRescueStationAssignment | null> {
		return this.queryBus.execute(
			new GetCurrentAssignmentOfEntity(organizationId, alertGroup.id),
		);
	}
}
