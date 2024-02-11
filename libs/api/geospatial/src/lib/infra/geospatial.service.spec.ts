import { Test, TestingModule } from '@nestjs/testing';
import { point, polygon, Position } from '@turf/turf';

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
		const coord1: Position = [13.405, 52.52];
		const coord2: Position = [2.3522, 48.8566];
		const distanceInMeters = geospatialService.getMetersBetweenCoords(
			coord1,
			coord2,
		);

		expect(distanceInMeters).toBeCloseTo(877464.5, 1);
	});

	describe('isIntersecting', () => {
		it('should correctly determine if two polygons intersect', () => {
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
			expect(geospatialService.isIntersecting(polygon2, polygon1)).toBe(true);
		});

		it('should correctly determine if two polygons do not intersect', () => {
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
			expect(geospatialService.isIntersecting(polygon2, polygon1)).toBe(false);
		});

		it('should correctly determine if boundaries intersect', () => {
			expect(
				geospatialService.isIntersecting(
					polygon([
						[
							[1, 2],
							[3, 4],
							[5, 6],
							[1, 2],
						],
					]),
					point([1, 2]),
				),
			).toBe(true);
		});

		it('should correctly determine if polygons within intersect', () => {
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
					[-74.00485109291682, 40.71344554213209],
					[-74.00485109291682, 40.71320208208249],
					[-74.00463882508765, 40.71320208208249],
					[-74.00463882508765, 40.71344554213209],
					[-74.00485109291682, 40.71344554213209],
				],
			]);

			expect(geospatialService.isIntersecting(polygon1, polygon2)).toBe(true);
			expect(geospatialService.isIntersecting(polygon2, polygon1)).toBe(true);
		});

		it('should correctly determine if points are equal', () => {
			expect(
				geospatialService.isIntersecting(point([1, 2]), point([1, 2])),
			).toBe(true);

			expect(
				geospatialService.isIntersecting(
					polygon([
						[
							[1, 2],
							[3, 4],
							[5, 6],
							[1, 2],
						],
					]),
					polygon([
						[
							[1, 2],
							[3, 4],
							[5, 6],
							[1, 2],
						],
					]),
				),
			).toBe(true);
		});

		it('should correctly determine if a point is within a polygon', () => {
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
				geospatialService.isIntersecting(
					pointWithinPolygon,
					polygonContainingPoint,
				),
			).toBe(true);
			expect(
				geospatialService.isIntersecting(
					polygonContainingPoint,
					pointWithinPolygon,
				),
			).toBe(true);
		});
	});
});
