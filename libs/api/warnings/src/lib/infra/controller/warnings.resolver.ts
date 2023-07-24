import { Inject } from '@nestjs/common';
import { Args, Float, Query, Resolver, Subscription } from '@nestjs/graphql';

import { GEOSPATIAL_SERVICE, GeospatialService } from '@kordis/api/geospatial';
import { GraphQLSubscriptionService } from '@kordis/api/shared';

import { NewWarningEvent } from '../../core/event/new-warning.event';
import { Warning } from '../../core/model/warning.model';
import {
	WARNING_SERVICE,
	WarningsService,
} from '../../core/service/warnings.service';
import { NewWarningArgs } from './args/new-warning.args';

@Resolver()
export class WarningsResolver {
	constructor(
		@Inject(WARNING_SERVICE) private readonly warningService: WarningsService,
		private readonly subscriptionService: GraphQLSubscriptionService,
		@Inject(GEOSPATIAL_SERVICE)
		private readonly geospatialService: GeospatialService,
	) {}

	@Query(() => [Warning])
	async getWarningsForLocation(
		@Args('latitude', { type: () => Float }) lat: number,
		@Args('longitude', { type: () => Float }) lon: number,
	): Promise<Warning[]> {
		return this.warningService.getWarningsForLocation(lat, lon);
	}

	@Subscription(() => Warning)
	async newWarning(
		@Args() { bbox }: NewWarningArgs,
	): Promise<AsyncIterableIterator<Warning>> {
		const bboxGeom = this.geospatialService.bboxToGeometry(bbox);
		return this.subscriptionService.getSubscriptionIteratorForEvent(
			NewWarningEvent,
			{
				filter: ({ warning }: NewWarningEvent) =>
					warning.affectedLocations.geometries.some(
						(geom) =>
							// check whether the area overlaps a warning or is completely within
							this.geospatialService.isIntersecting(geom, bboxGeom) ||
							this.geospatialService.isCompletelyWithin(geom, bboxGeom) ||
							this.geospatialService.isCompletelyWithin(bboxGeom, geom),
					),
				map: ({ warning }: NewWarningEvent) => warning,
			},
		);
	}
}
