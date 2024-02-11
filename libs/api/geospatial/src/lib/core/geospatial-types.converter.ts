import { Geometry, Position } from '@turf/turf';

import { BBox } from '../models';

export const GEOSPATIAL_TYPE_CONVERTER = Symbol('GEOSPATIAL_TYPE_CONVERTER');

export interface GeospatialTypesConverter {
	bboxToGeometry(bbox: BBox): Geometry;

	coordinateToPosition(lat: number, lon: number): Position;

	coordinateToPosition(coord: { lat: number; lon: number }): Position;
}
