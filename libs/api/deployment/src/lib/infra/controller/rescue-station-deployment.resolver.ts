import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
	Args,
	Context,
	ID,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
	Subscription,
} from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import {
	DataLoaderContextProvider,
	GraphQLSubscriptionService,
} from '@kordis/api/shared';
import {
	ALERT_GROUPS_DATA_LOADER,
	AlertGroupViewModel,
	UNITS_DATA_LOADER,
	UnitViewModel,
} from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import { ResetRescueStationsCommand } from '../../core/command/reset-rescue-stations.command';
import { UpdateRescueStationNoteCommand } from '../../core/command/update-rescue-station-note.command';
import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';
import { RescueStationDeploymentEntity } from '../../core/entity/rescue-station-deployment.entity';
import { RescueStationNoteUpdatedEvent } from '../../core/event/rescue-station-note-updated.event';
import { RescueStationsResetEvent } from '../../core/event/rescue-stations-reset.event';
import { GetDeploymentsQuery } from '../../core/query/get-deployments.query';
import { GetRescueStationDeploymentQuery } from '../../core/query/get-rescue-station-deployment.query';
import { RescueStationEntityDTO } from '../../core/repository/rescue-station-deployment.repository';
import { RescueStationDeploymentViewModel } from '../rescue-station.view-model';
import { RescueStationFilterArgs } from './rescue-station-filter.args';

@Resolver(() => RescueStationDeploymentViewModel)
export class RescueStationDeploymentResolver {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly commandBus: CommandBus,
		private readonly gqlSubscriptionService: GraphQLSubscriptionService,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	@Query(() => [RescueStationDeploymentViewModel])
	async rescueStationDeployments(
		@RequestUser() { organizationId }: AuthUser,
		@Args({ nullable: true }) filter?: RescueStationFilterArgs,
	): Promise<RescueStationDeploymentEntity[]> {
		const filterDto: RescueStationEntityDTO | undefined = filter
			? await this.mapper.mapAsync(
					filter,
					RescueStationFilterArgs,
					RescueStationEntityDTO,
				)
			: undefined;

		return this.queryBus.execute<
			GetDeploymentsQuery,
			RescueStationDeploymentEntity[]
		>(new GetDeploymentsQuery(organizationId, filterDto));
	}

	@Query(() => RescueStationDeploymentViewModel)
	async rescueStationDeployment(
		@RequestUser() { organizationId }: AuthUser,
		@Args('id', { type: () => ID }) id: string,
	): Promise<RescueStationDeploymentEntity> {
		return this.queryBus.execute(
			new GetRescueStationDeploymentQuery(organizationId, id),
		);
	}

	@ResolveField()
	async assignments(
		@Parent() entity: RescueStationDeploymentEntity,
	): Promise<(DeploymentUnit | DeploymentAlertGroup)[]> {
		return [...entity.assignedUnits, ...entity.assignedAlertGroups];
	}

	@Mutation(() => [RescueStationDeploymentEntity])
	async resetRescueStations(
		@RequestUser() { organizationId }: AuthUser,
	): Promise<RescueStationDeploymentEntity[]> {
		await this.commandBus.execute(
			new ResetRescueStationsCommand(organizationId),
		);
		return this.queryBus.execute<
			GetDeploymentsQuery,
			RescueStationDeploymentEntity[]
		>(new GetDeploymentsQuery(organizationId));
	}

	@Mutation(() => RescueStationDeploymentViewModel)
	async updateRescueStationNote(
		@RequestUser() { organizationId }: AuthUser,
		@Args('id', { type: () => ID }) rescueStationId: string,
		@Args('note') note: string,
	): Promise<RescueStationDeploymentViewModel> {
		await this.commandBus.execute(
			new UpdateRescueStationNoteCommand(organizationId, rescueStationId, note),
		);
		return this.queryBus.execute(
			new GetRescueStationDeploymentQuery(organizationId, rescueStationId),
		);
	}

	@Subscription(() => Boolean)
	rescueStationsReset(
		@RequestUser() { organizationId }: AuthUser,
	): AsyncIterableIterator<boolean> {
		return this.gqlSubscriptionService.getSubscriptionIteratorForEvent(
			RescueStationsResetEvent,
			'rescueStationsReset',
			{
				filter: (payload) => payload.orgId === organizationId,
				map: () => true,
			},
		);
	}

	@Subscription(() => RescueStationDeploymentViewModel)
	rescueStationNoteUpdated(
		@RequestUser() { organizationId }: AuthUser,
	): AsyncIterableIterator<RescueStationDeploymentViewModel> {
		return this.gqlSubscriptionService.getSubscriptionIteratorForEvent(
			RescueStationNoteUpdatedEvent,
			'rescueStationNoteUpdated',
			{
				filter: ({ orgId }) => orgId === organizationId,
				map: ({ rescueStationId }) =>
					this.queryBus.execute(
						new GetRescueStationDeploymentQuery(
							organizationId,
							rescueStationId,
						),
					),
			},
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
