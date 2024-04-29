import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
	Args,
	Int,
	Mutation,
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
import { AuthUser } from '@kordis/shared/model';

import { UpdateUnitNoteCommand } from '../../core/command/update-unit-note.command';
import { UpdateUnitStatusCommand } from '../../core/command/update-unit-status.command';
import { UnitEntity } from '../../core/entity/unit.entity';
import { UnitStatusUpdatedEvent } from '../../core/event/unit-status-updated.event';
import { UnitStatusOutdatedException } from '../../core/exception/unit-status-outdated.exception';
import { GetUnitByIdQuery } from '../../core/query/get-unit-by-id.query';
import { GetUnitsByOrgQuery } from '../../core/query/get-units-by-org.query';
import { PresentableUnitStatusOutdatedException } from '../exceptions/presentable-unit-status-outdated.exception';
import { UnitViewModel } from '../unit.view-model';

@Resolver()
export class UnitResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly gqlSubscriptionsService: GraphQLSubscriptionService,
	) {}

	@Query(() => [UnitViewModel])
	async units(
		@RequestUser() { organizationId }: AuthUser,
	): Promise<UnitEntity[]> {
		return this.queryBus.execute(new GetUnitsByOrgQuery(organizationId));
	}

	@Query(() => UnitViewModel)
	async unit(
		@Args('id') id: string,
		@RequestUser() { organizationId }: AuthUser,
	): Promise<UnitEntity[]> {
		return this.queryBus.execute(new GetUnitByIdQuery(organizationId, id));
	}

	@Mutation(() => UnitViewModel)
	async updateUnitNote(
		@RequestUser() { organizationId }: AuthUser,
		@Args('unitId') id: string,
		@Args('note') note: string,
	): Promise<UnitEntity> {
		await this.commandBus.execute(
			new UpdateUnitNoteCommand(organizationId, id, note),
		);

		return this.queryBus.execute(new GetUnitByIdQuery(organizationId, id));
	}

	@Mutation(() => UnitViewModel)
	async updateUnitStatus(
		@RequestUser() user: AuthUser,
		@Args('unitId') id: string,
		@Args('status', { type: () => Int }) status: number,
	): Promise<UnitEntity> {
		try {
			await this.commandBus.execute(
				new UpdateUnitStatusCommand(
					user.organizationId,
					id,
					status,
					new Date(),
					user.firstName + ' ' + user.lastName,
				),
			);

			return this.queryBus.execute(
				new GetUnitByIdQuery(user.organizationId, id),
			);
		} catch (error) {
			if (error instanceof ValidationException) {
				throw PresentableValidationException.fromCoreValidationException(
					'Der Status enthalten invalide Werte.',
					error,
				);
			} else if (error instanceof UnitStatusOutdatedException) {
				throw new PresentableUnitStatusOutdatedException();
			}

			throw error;
		}
	}

	@Subscription(() => UnitViewModel)
	unitStatusUpdated(
		@RequestUser() { organizationId }: AuthUser,
	): AsyncIterableIterator<UnitViewModel> {
		return this.gqlSubscriptionsService.getSubscriptionIteratorForEvent(
			UnitStatusUpdatedEvent,
			'unitStatusUpdated',
			{
				filter: (event) => event.orgId === organizationId,
				map: (event) =>
					this.queryBus.execute<GetUnitByIdQuery, UnitEntity>(
						new GetUnitByIdQuery(organizationId, event.unitId),
					),
			},
		);
	}
}
