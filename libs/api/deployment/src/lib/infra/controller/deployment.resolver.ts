import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
	Args,
	Context,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import { DataLoaderContextProvider } from '@kordis/api/shared';
import { AlertGroupViewModel, UnitViewModel } from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';
import { RescueStationDeploymentEntity } from '../../core/entity/rescue-station-deployment.entity';
import { GetDeploymentsQuery } from '../../core/query/get-deployments.query';
import { GetUnassignedEntitiesQuery } from '../../core/query/get-unassigned-entities.query';
import { RescueStationEntityDTO } from '../../core/repository/rescue-station-deployment.repository';
import { ALERT_GROUPS_DATA_LOADER } from '../data-loader/alert-groups.data-loader';
import { UNITS_DATA_LOADER } from '../data-loader/units.data-loader';
import {
	DeploymentAssignment,
	RescueStationDeploymentViewModel,
} from '../rescue-station.view-model';
import { RescueStationFilterArgs } from './rescue-station-filter.args';

@Resolver()
export class DeploymentResolver {
	constructor(
		private readonly queryBus: QueryBus,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	@Query(() => [RescueStationDeploymentViewModel])
	async rescueStationDeployments(
		@RequestUser() { organizationId }: AuthUser,
		@Args({ nullable: true }) filter?: RescueStationFilterArgs,
	): Promise<RescueStationDeploymentViewModel[]> {
		const filterDto: RescueStationEntityDTO | undefined = filter
			? await this.mapper.mapAsync(
					filter,
					RescueStationFilterArgs,
					RescueStationEntityDTO,
				)
			: undefined;

		const deployments = await this.queryBus.execute<
			GetDeploymentsQuery,
			RescueStationDeploymentEntity[]
		>(new GetDeploymentsQuery(organizationId, filterDto));

		return this.mapper.mapArrayAsync(
			deployments,
			RescueStationDeploymentEntity,
			RescueStationDeploymentViewModel,
		);
	}

	@Query(() => [DeploymentAssignment])
	async unassignedEntities(
		@RequestUser() { organizationId }: AuthUser,
	): Promise<(DeploymentUnit | DeploymentAlertGroup)[]> {
		return this.queryBus.execute(
			new GetUnassignedEntitiesQuery(organizationId),
		);
	}
}

@Resolver(() => DeploymentUnit)
export class DeploymentUnitResolver {
	@ResolveField()
	async unit(
		@Parent() { unit }: DeploymentUnit,
		@Context()
		{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<UnitViewModel> {
		const loader = loadersProvider.getLoader<string, UnitViewModel>(
			UNITS_DATA_LOADER,
		);
		return loader.load(unit.id);
	}
}

@Resolver(() => RescueStationDeploymentViewModel)
export class RescueStationDeploymentDefaultUnitsResolver {
	@ResolveField()
	async defaultUnits(
		@Parent() { defaultUnits }: RescueStationDeploymentViewModel,
		@Context()
		{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<UnitViewModel[]> {
		const loader = loadersProvider.getLoader<string, UnitViewModel>(
			UNITS_DATA_LOADER,
		);
		// check if any error occurred, fail fast
		const res = await loader.loadMany(defaultUnits.map(({ id }) => id));
		const error = res.find(
			(possibleError: unknown) => possibleError instanceof Error,
		);
		if (error) {
			throw error;
		}
		return res as UnitViewModel[];
	}
}

@Resolver(() => DeploymentAlertGroup)
export class DeploymentAlertGroupResolver {
	@ResolveField()
	async alertGroup(
		@Parent() { alertGroup }: DeploymentAlertGroup,
		@Context()
		{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<AlertGroupViewModel> {
		const loader = loadersProvider.getLoader<string, AlertGroupViewModel>(
			ALERT_GROUPS_DATA_LOADER,
		);
		return loader.load(alertGroup.id);
	}
}
