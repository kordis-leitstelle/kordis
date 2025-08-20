import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthUser } from '@kordis/shared/model';

import { GeoFeature } from '../../core/entity/geo-features.entity';
import { GetGeoFeaturesQuery } from '../../core/query/get-geo-features.query';
import { GeoFeaturesResolver } from './geo-features.resolver';

describe('GeoFeaturesResolver', () => {
	let resolver: GeoFeaturesResolver;
	let queryBusMock: DeepMocked<QueryBus>;

	beforeEach(async () => {
		queryBusMock = createMock<QueryBus>();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GeoFeaturesResolver,
				{
					provide: QueryBus,
					useValue: queryBusMock,
				},
			],
		}).compile();

		resolver = module.get<GeoFeaturesResolver>(GeoFeaturesResolver);
	});

	it('should resolve geo features for the organization', async () => {
		const mockFeatures: GeoFeature[] = [];
		queryBusMock.execute.mockResolvedValueOnce(mockFeatures);

		const authUser = { organizationId: 'org-123' } as AuthUser;

		await expect(resolver.geoFeatures(authUser)).resolves.toBe(mockFeatures);
		expect(queryBusMock.execute).toHaveBeenCalledWith(
			new GetGeoFeaturesQuery('org-123'),
		);
	});
});
