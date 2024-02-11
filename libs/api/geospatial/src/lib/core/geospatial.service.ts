import { Feature, Geometry, Position } from '@turf/turf';

export const GEOSPATIAL_SERVICE = Symbol('GEOSPATIAL_SERVICE');

export interface GeospatialService {
	getMetersBetweenCoords(coord1: Position, coord2: Position): number;

	/*
	 * Checks whether two features intersect, meaning, if the intersection of the two features is not empty (this also includes geometries that are completely within another).
	 */
	isIntersecting(
		feature1: Geometry | Feature,
		feature2: Geometry | Feature,
	): boolean;
}
