import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GeoFeature } from '../../core/entity/geo-features.entity';
import {
	GEO_FEATURE_REPOSITORY,
	GeoFeatureRepository,
} from '../repository/geo-feature.repository';

export class GetGeoFeaturesQuery {
	constructor(public readonly orgId: string) {}
}

@QueryHandler(GetGeoFeaturesQuery)
export class GetGeoFeaturesHandler
	implements IQueryHandler<GetGeoFeaturesQuery>
{
	constructor(
		@Inject(GEO_FEATURE_REPOSITORY)
		private readonly repository: GeoFeatureRepository,
	) {}

	execute({ orgId }: GetGeoFeaturesQuery): Promise<GeoFeature[]> {
		return this.repository.findAll(orgId);
	}
}
