import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { GeoFeature } from '../entity/geo-features.entity';
import {
	GEO_FEATURE_REPOSITORY,
	GeoFeatureRepository,
} from '../repository/geo-feature.repository';
import {
	GetGeoFeaturesHandler,
	GetGeoFeaturesQuery,
} from './get-geo-features.query';

describe('GetGeoFeaturesHandler', () => {
	let handler: GetGeoFeaturesHandler;
	let repository: DeepMocked<GeoFeatureRepository>;

	beforeEach(async () => {
		const repositoryMock = createMock<GeoFeatureRepository>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				GetGeoFeaturesHandler,
				{
					provide: GEO_FEATURE_REPOSITORY,
					useValue: repositoryMock,
				},
			],
		}).compile();

		handler = moduleRef.get<GetGeoFeaturesHandler>(GetGeoFeaturesHandler);
		repository = moduleRef.get(GEO_FEATURE_REPOSITORY);
	});

	it('should return geo features from repository', async () => {
		const features: GeoFeature[] = [];
		repository.findAll.mockResolvedValueOnce(features);

		const query = new GetGeoFeaturesQuery('org-123');
		await expect(handler.execute(query)).resolves.toBe(features);
		expect(repository.findAll).toHaveBeenCalledWith('org-123');
	});
});
