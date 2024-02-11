import { Test, TestingModule } from '@nestjs/testing';

import { GeospatialTypesConverterImpl } from './geospatial-types.converter';

describe('GeospatialTypesConverter', () => {
	let geospatialTypesConverter: GeospatialTypesConverterImpl;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [GeospatialTypesConverterImpl],
		}).compile();

		geospatialTypesConverter = module.get<GeospatialTypesConverterImpl>(
			GeospatialTypesConverterImpl,
		);
	});

	it('should correctly convert a BBox to a Polygon geometry', () => {
		const bbox = {
			topLeft: { lon: -74.047185, lat: 40.679648 },
			bottomRight: { lon: -73.907005, lat: 40.882078 },
		};
		const result = geospatialTypesConverter.bboxToGeometry(bbox);

		expect(result.type).toBe('Polygon');
		expect(result.coordinates).toEqual([
			[
				[-74.047185, 40.679648],
				[-73.907005, 40.679648],
				[-73.907005, 40.882078],
				[-74.047185, 40.882078],
				[-74.047185, 40.679648],
			],
		]);
	});

	describe('coordinateToPosition', () => {
		it('should return Position when latitude and longitude numbers are passed', () => {
			const lat: number = 34.0522;
			const lon: number = -118.2437;

			const result = geospatialTypesConverter.coordinateToPosition(lat, lon);
			expect(result).toEqual([lon, lat]);
		});

		it('should return Position when latitude and longitude object is passed', () => {
			const coord = { lat: 34.0522, lon: -118.2437 };

			const result = geospatialTypesConverter.coordinateToPosition(coord);
			expect(result).toEqual([coord.lon, coord.lat]);
		});
	});
});
