import { QueryBus } from '@nestjs/cqrs';
import { Query, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import { AuthUser } from '@kordis/shared/model';

import { GeoFeature } from '../../core/entity/geo-features.entity';
import { GetGeoFeaturesQuery } from '../../core/query/get-geo-features.query';

@Resolver()
export class GeoFeaturesResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@Query(() => [GeoFeature])
	async geoFeatures(
		@RequestUser() { organizationId }: AuthUser,
	): Promise<GeoFeature[]> {
		return this.queryBus.execute(new GetGeoFeaturesQuery(organizationId));
	}
}
