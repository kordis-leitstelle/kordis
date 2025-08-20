import { GeoFeature } from '../../core/entity/geo-features.entity';

export const GEO_FEATURE_REPOSITORY = Symbol('GEO_FEATURE_REPOSITORY');

export interface GeoFeatureRepository {
	findAll(orgId: string): Promise<GeoFeature[]>;
}
