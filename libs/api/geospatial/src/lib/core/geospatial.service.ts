import { Feature, Geometry } from '@turf/turf';

import { BBox } from '@kordis/api/shared';

export const GEOSPATIAL_SERVICE = Symbol('GEOSPATIAL_SERVICE');

export interface GeospatialService {
	getMetersBetweenCoords(
		coord1: { lat: number; lon: number },
		coord2: { lat: number; lon: number },
	): number;

	/*
	 * Checks whether the first feature is completely within the second feature.
	 */
	isCompletelyWithin(
		possibleInner: Geometry | Feature,
		possibleOuter: Geometry | Feature,
	): boolean;

	/*
	 * Checks whether two features intersect, meaning, if the intersection of the two features is not empty and not one of the geometries itself.
	 */
	isIntersecting(
		feature1: Geometry | Feature,
		feature2: Geometry | Feature,
	): boolean;

	bboxToGeometry(bbox: BBox): Geometry;
}
