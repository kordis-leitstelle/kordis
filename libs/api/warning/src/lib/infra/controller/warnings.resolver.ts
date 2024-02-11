import { Inject } from '@nestjs/common';
import { Args, Float, Query, Resolver, Subscription } from '@nestjs/graphql';
import {
	GraphQLSubscriptionService,
	observableToAsyncIterable,
} from '@kordis/api/shared';
import { Warning } from '../../core/model/warning.model';
import {
	WARNINGS_SERVICE,
	WarningsService,
} from '../../core/service/warnings.service';
import { NewWarningArgs } from './args/new-warning.args';
import {
	GEOSPATIAL_TYPE_CONVERTER,
	GeospatialTypesConverter,
} from '@kordis/api/geospatial';

@Resolver()
export class WarningsResolver {
	constructor(
		@Inject(WARNINGS_SERVICE)
		private readonly warningService: WarningsService,
		private readonly subscriptionService: GraphQLSubscriptionService,
		@Inject(GEOSPATIAL_TYPE_CONVERTER)
		private readonly geospatialTypeConverter: GeospatialTypesConverter,
	) {}

	@Query(() => [Warning])
	async warningsForLocation(
		@Args('latitude', { type: () => Float }) lat: number,
		@Args('longitude', { type: () => Float }) lon: number,
	): Promise<Warning[]> {
		return this.warningService.getWarningsForLocation(lat, lon);
	}

	@Subscription(() => Warning)
	async newWarning(
		@Args() { bbox }: NewWarningArgs,
	): Promise<AsyncIterableIterator<Warning>> {
		return observableToAsyncIterable(
			this.warningService.getWarningsInGeometryStream$(
				this.geospatialTypeConverter.bboxToGeometry(bbox),
			),
		);
	}
}
