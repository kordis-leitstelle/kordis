import { Test, TestingModule } from '@nestjs/testing';
import { point, polygon } from '@turf/turf';

import { GeospatialServiceImpl } from './geospatial.service';

describe('GeospatialService', () => {
	let geospatialService: GeospatialServiceImpl;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [GeospatialServiceImpl],
		}).compile();

		geospatialService = module.get<GeospatialServiceImpl>(
			GeospatialServiceImpl,
		);
	});

	it('should calculate the correct distance in meters between two coordinates', () => {
		const coord1 = { lat: 52.52, lon: 13.405 };
		const coord2 = { lat: 48.8566, lon: 2.3522 };
		const distanceInMeters = geospatialService.getMetersBetweenCoords(
			coord1,
			coord2,
		);

		expect(distanceInMeters).toBeCloseTo(877464.5, 1);
	});

	describe('isCompletelyWithin', () => {
		it('should correctly determine if a point is completely within a polygon', () => {
			const pointWithinPolygon = point([-74.0055, 40.7129]);
			const polygonContainingPoint = polygon([
				[
					[-74.006, 40.7128],
					[-74.005, 40.7128],
					[-74.005, 40.7138],
					[-74.006, 40.7138],
					[-74.006, 40.7128],
				],
			]);

			expect(
				geospatialService.isCompletelyWithin(
					pointWithinPolygon,
					polygonContainingPoint,
				),
			).toBe(true);
		});

		it('should correctly determine if a point is not completely within a polygon', () => {
			const pointOutsidePolygon = point([-74.001, 40.7129]);
			const polygonContainingPoint = polygon([
				[
					[-74.006, 40.7128],
					[-74.005, 40.7128],
					[-74.005, 40.7138],
					[-74.006, 40.7138],
					[-74.006, 40.7128],
				],
			]);

			expect(
				geospatialService.isCompletelyWithin(
					pointOutsidePolygon,
					polygonContainingPoint,
				),
			).toBe(false);
		});
	});

	describe('isIntersecting', () => {
		it('should correctly determine if two geometries intersect', () => {
			const polygon1 = polygon([
				[
					[-74.00526550241943, 40.714024620673655],
					[-74.00526550241943, 40.712640295318295],
					[-74.00446829543361, 40.712640295318295],
					[-74.00446829543361, 40.714024620673655],
					[-74.00526550241943, 40.714024620673655],
				],
			]);
			const polygon2 = polygon([
				[
					[-74.006, 40.7128],
					[-74.005, 40.7128],
					[-74.005, 40.7138],
					[-74.006, 40.7138],
					[-74.006, 40.7128],
				],
			]);

			expect(geospatialService.isIntersecting(polygon1, polygon2)).toBe(true);
		});

		it('should correctly determine if two geometries do not intersect', () => {
			const polygon1 = polygon([
				[
					[-74.0035116469346, 40.713914754479504],
					[-74.0035116469346, 40.71339838166236],
					[-74.00293186003594, 40.71339838166236],
					[-74.00293186003594, 40.713914754479504],
					[-74.0035116469346, 40.713914754479504],
				],
			]);
			const polygon2 = polygon([
				[
					[-74.006, 40.7128],
					[-74.005, 40.7128],
					[-74.005, 40.7138],
					[-74.006, 40.7138],
					[-74.006, 40.7128],
				],
			]);

			expect(geospatialService.isIntersecting(polygon1, polygon2)).toBe(false);
		});
	});

	it('should correctly convert a BBox to a Polygon geometry', () => {
		const bbox = {
			topLeft: { lon: -74.047185, lat: 40.679648 },
			bottomRight: { lon: -73.907005, lat: 40.882078 },
		};
		const result = geospatialService.bboxToGeometry(bbox);

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
});
