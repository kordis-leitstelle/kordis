import { QueryBus } from '@nestjs/cqrs';
import {
	Context,
	Parent,
	Query,
	ResolveField,
	Resolver,
	Subscription,
} from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import {
	OPERATION_DATA_LOADER,
	OperationViewModel,
} from '@kordis/api/operation';
import {
	DataLoaderContextProvider,
	GraphQLSubscriptionService,
} from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';
import { OperationDeploymentEntity } from '../../core/entity/operation-deplyoment.entity';
import { OperationDeploymentCreatedEvent } from '../../core/event/operation-deployment-created.event';
import { OperationDeploymentRemovedEvent } from '../../core/event/operation-deployment-removed.event';
import { OperationDeploymentUpdatedEvent } from '../../core/event/operation-deployment-updated.event';
import { GetOperationDeploymentByIdQuery } from '../../core/query/get-operation-deployment-by-id.query';
import { GetOperationDeploymentsQuery } from '../../core/query/get-operation-deployments.query';
import { OperationDeploymentViewModel } from '../view-model/operation-deployment.view-model';
import { RescueStationDeploymentViewModel } from '../view-model/rescue-station.view-model';
import { EntityOperationAssignment } from './deployment-assignment.resolver';

@Resolver(() => OperationDeploymentViewModel)
export class OperationDeploymentResolver {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly gqlSubscriptionService: GraphQLSubscriptionService,
	) {}

	@Query(() => [OperationDeploymentViewModel])
	async operationDeployments(
		@RequestUser() { organizationId }: AuthUser,
	): Promise<OperationDeploymentViewModel[]> {
		return this.queryBus.execute(
			new GetOperationDeploymentsQuery(organizationId),
		);
	}

	@ResolveField()
	async assignments(
		@Parent() entity: OperationDeploymentEntity,
	): Promise<(DeploymentUnit | DeploymentAlertGroup)[]> {
		return [...entity.assignedUnits, ...entity.assignedAlertGroups];
	}

	@ResolveField()
	async operation(
		@Parent() { operation }: OperationDeploymentViewModel,
		@Context()
		{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<OperationViewModel> {
		const loader = loadersProvider.getLoader<string, OperationViewModel>(
			OPERATION_DATA_LOADER,
		);
		return loader.load(operation.id);
	}

	@Subscription(() => OperationDeploymentViewModel)
	operationDeploymentCreated(
		@RequestUser() { organizationId }: AuthUser,
	): AsyncIterableIterator<RescueStationDeploymentViewModel> {
		return this.gqlSubscriptionService.getSubscriptionIteratorForEvent(
			OperationDeploymentCreatedEvent,
			'operationDeploymentCreated',
			{
				filter: ({ orgId }) => orgId === organizationId,
				map: ({ deploymentId }) =>
					this.queryBus.execute(
						new GetOperationDeploymentByIdQuery(organizationId, deploymentId),
					),
			},
		);
	}

	@Subscription(() => Boolean)
	operationDeploymentRemoved(
		@RequestUser() { organizationId }: AuthUser,
	): AsyncIterableIterator<true> {
		return this.gqlSubscriptionService.getSubscriptionIteratorForEvent(
			OperationDeploymentRemovedEvent,
			'operationDeploymentRemoved',
			{
				filter: (event) => event.orgId === organizationId,
				map: () => true,
			},
		);
	}

	@Subscription(() => OperationDeploymentViewModel)
	operationDeploymentUpdated(
		@RequestUser() { organizationId }: AuthUser,
	): AsyncIterableIterator<RescueStationDeploymentViewModel> {
		return this.gqlSubscriptionService.getSubscriptionIteratorForEvent(
			OperationDeploymentUpdatedEvent,
			'operationDeploymentUpdated',
			{
				filter: ({ orgId }) => orgId === organizationId,
				map: ({ deploymentId }) =>
					this.queryBus.execute(
						new GetOperationDeploymentByIdQuery(organizationId, deploymentId),
					),
			},
		);
	}
}

// As EntityOperationAssignment is a custom type, we need to create an own resolver for it (but not for the rescue station deployment, as the assignment does not need further resolvement as it lives inside this domain).
@Resolver(() => EntityOperationAssignment)
export class EntityOperationAssignmentResolver {
	@ResolveField()
	async operation(
		@Parent() { operation }: OperationDeploymentViewModel,
		@Context()
		{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<OperationViewModel> {
		const loader = loadersProvider.getLoader<string, OperationViewModel>(
			OPERATION_DATA_LOADER,
		);
		return loader.load(operation.id);
	}
}
