import { Inject } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';

import { User } from '@kordis/api/auth';
import { observableToAsyncIterable } from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/auth';

import { ShipPositionFeature } from '../../core/entity/ship-position.entity';
import {
	SHIP_POSITIONS_SERVICE_PROVIDER,
	ShipPositionsServiceProvider,
} from '../../core/service/ship-positions-service.provider';

@Resolver(() => ShipPositionFeature)
export class ShipPositionsResolver {
	constructor(
		@Inject(SHIP_POSITIONS_SERVICE_PROVIDER)
		private readonly shipPositionsServiceProvider: ShipPositionsServiceProvider,
	) {}

	@Query(() => [ShipPositionFeature])
	async shipPositions(
		@User() { organization }: AuthUser,
	): Promise<ShipPositionFeature[]> {
		const shipPositionsService = await this.shipPositionsServiceProvider.forOrg(
			organization,
		);
		return shipPositionsService.getAll();
	}

	@Query(() => [ShipPositionFeature])
	async findShips(
		@User() { organization }: AuthUser,
		@Args('query', { description: 'Can search for MMSI, Call Sign and Name.' })
		query: string,
		@Args('limit', { defaultValue: 5 })
		limit: number,
		//	@User() { organization }: AuthUser,
	): Promise<ShipPositionFeature[]> {
		const shipPositionsService = await this.shipPositionsServiceProvider.forOrg(
			organization,
		);
		return shipPositionsService.search(query, limit);
	}

	@Subscription(() => ShipPositionFeature, {
		resolve: (value) => value,
	})
	async shipPositionChanged(
		@User() { organization }: AuthUser,
	): Promise<AsyncIterableIterator<ShipPositionFeature>> {
		const shipPositionsService = await this.shipPositionsServiceProvider.forOrg(
			organization,
		);
		return observableToAsyncIterable(shipPositionsService.getChangeStream$());
	}
}
