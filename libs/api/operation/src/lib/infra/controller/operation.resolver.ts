import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
	Args,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Subscription,
} from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import {
	GraphQLSubscriptionService,
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';
import { GetUnitByIdQuery, UnitViewModel } from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import {
	ArchiveOperationCommand,
	CreateOperationCommand,
	DeleteOperationCommand,
	SetCompletedOperationInvolvementsCommand,
	UpdateOperationBaseDataCommand,
} from '../../core/command';
import { OperationEntity } from '../../core/entity/operation.entity';
import { OperationCreatedEvent } from '../../core/event/operation-created.event';
import { OperationDeletedEvent } from '../../core/event/operation-deleted.event';
import { UnitAlreadyInvolvedException } from '../../core/exceptions/unit-already-involved.exception';
import { GetOperationByIdQuery } from '../../core/query/get-operation-by-id.query';
import { GetOperationsByOrgIdQuery } from '../../core/query/get-operations-by-org-id.query';
import { PresentableUnitAlreadyInvolvedException } from '../exception/presentable-unit-already-involved.exception';
import { OperationViewModel } from '../operation.view-model';
import { CreateOperationInput } from './args/create-completed-operation.args';
import { OperationFilterInput } from './args/operation-filter.args';
import { UpdateOperationBaseDataInput } from './args/update-operation-base-data.args';
import { UpdateOperationInvolvementsInput } from './args/update-operation-involvement.args';

// todo: im manager, wenn einsatz beendet, müssen alle ausstehenden zuordnungen gelöscht werden (isPending=false)
// vielleicht ende nur via einsatzende setzen können?

@ObjectType()
export class DeletedOperationModel {
	@Field()
	operationId: string;
}

@Resolver()
export class OperationResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly graphqlSubscriptionService: GraphQLSubscriptionService,
		@Inject(getMapperToken()) private readonly mapper: Mapper,
	) {}

	@Query(() => [OperationViewModel])
	async operations(
		@RequestUser() { organizationId }: AuthUser,
		@Args('sortBySignAsc', { nullable: true }) sortBySignAsc?: boolean,
		@Args('filter', { nullable: true }) filter?: OperationFilterInput,
	): Promise<OperationViewModel[]> {
		return this.queryBus.execute(
			new GetOperationsByOrgIdQuery(organizationId, filter, sortBySignAsc),
		);
	}

	@Query(() => OperationViewModel)
	async operation(
		@RequestUser() { organizationId }: AuthUser,
		@Args('id') operationId: string,
	): Promise<OperationViewModel[]> {
		return this.queryBus.execute(
			new GetOperationByIdQuery(organizationId, operationId),
		);
	}

	@Mutation(() => OperationViewModel)
	async createOperation(
		@RequestUser() requestUser: AuthUser,
		@Args('operation') payload: CreateOperationInput,
	): Promise<OperationViewModel> {
		return this.commandBus.execute(
			new CreateOperationCommand(
				requestUser,
				payload.start,
				payload.end,
				payload.location,
				payload.alarmKeyword,
				payload.assignedUnitIds,
				payload.assignedAlertGroups,
			),
		);
	}

	@Mutation(() => Boolean)
	async deleteOperation(
		@RequestUser() requestUser: AuthUser,
		@Args('id') id: string,
	): Promise<true | never> {
		await this.commandBus.execute(
			new DeleteOperationCommand(requestUser.organizationId, requestUser, id),
		);
		return true;
	}

	@Mutation(() => Boolean)
	async archiveOperation(
		@RequestUser() { organizationId }: AuthUser,
		@Args('id') id: string,
	): Promise<true | never> {
		try {
			await this.commandBus.execute(
				new ArchiveOperationCommand(organizationId, id),
			);
		} catch (error) {
			if (error instanceof ValidationException) {
				throw PresentableValidationException.fromCoreValidationException(
					'Der Einsatz konnte nicht archiviert werden!',
					error,
				);
			} else {
				throw error;
			}
		}

		return true;
	}

	@Mutation(() => OperationViewModel)
	async updateOperationBaseData(
		@RequestUser() { organizationId }: AuthUser,
		@Args('id') id: string,
		@Args('data') payload: UpdateOperationBaseDataInput,
	): Promise<OperationViewModel> {
		if (!Object.keys(payload).length) {
			throw new PresentableValidationException(
				'Es wurde keine Änderung vorgenommen',
				[
					{
						path: ['data'],
						errors: ['Es muss mindestens eine Eigenschaft geändert werden'],
					},
				],
			);
		}

		await this.commandBus.execute(
			new UpdateOperationBaseDataCommand(organizationId, id, payload),
		);

		return this.queryBus.execute(new GetOperationByIdQuery(organizationId, id));
	}

	@Mutation(() => OperationViewModel)
	async updateOperationInvolvements(
		@RequestUser() { organizationId }: AuthUser,
		@Args('id') id: string,
		@Args('involvements')
		{
			unitInvolvements,
			alertGroupInvolvements,
		}: UpdateOperationInvolvementsInput,
	): Promise<OperationViewModel> {
		try {
			await this.commandBus.execute(
				new SetCompletedOperationInvolvementsCommand(
					organizationId,
					id,
					unitInvolvements,
					alertGroupInvolvements,
				),
			);
		} catch (error) {
			await this.throwPresentable(error);
		}

		return this.queryBus.execute(new GetOperationByIdQuery(organizationId, id));
	}

	@Subscription(() => OperationViewModel)
	operationCreated(
		@RequestUser() { organizationId }: AuthUser,
	): AsyncIterator<OperationViewModel> {
		return this.graphqlSubscriptionService.getSubscriptionIteratorForEvent(
			OperationCreatedEvent,
			'operationCreated',
			{
				filter: (event) => event.orgId === organizationId,
				map: ({ operation }) => operation,
			},
		);
	}

	@Subscription(() => DeletedOperationModel)
	operationDeleted(
		@RequestUser() { organizationId }: AuthUser,
	): AsyncIterator<DeletedOperationModel> {
		return this.graphqlSubscriptionService.getSubscriptionIteratorForEvent(
			OperationDeletedEvent,
			'operationDeleted',
			{
				filter: (event) => event.orgId === organizationId,
				map: (event) => ({
					operationId: event.operationId,
				}),
			},
		);
	}

	private async throwPresentable(error: unknown): Promise<never> {
		if (error instanceof UnitAlreadyInvolvedException) {
			const { sign } = await this.queryBus.execute<
				GetOperationByIdQuery,
				OperationEntity
			>(new GetOperationByIdQuery(error.orgId, error.operationId));
			const { callSign } = await this.queryBus.execute<
				GetUnitByIdQuery,
				UnitViewModel
			>(new GetUnitByIdQuery(error.orgId, error.unitId));
			throw new PresentableUnitAlreadyInvolvedException(callSign, sign);
		}

		throw error;
	}
}
