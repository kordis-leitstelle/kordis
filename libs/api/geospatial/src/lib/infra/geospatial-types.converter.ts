import { Injectable } from '@nestjs/common';
import { Geometry, Position, bboxPolygon } from '@turf/turf';

import { GeospatialTypesConverter } from '../core/geospatial-types.converter';
import { BBox } from '../models';

@Injectable()
export class GeospatialTypesConverterImpl implements GeospatialTypesConverter {
	bboxToGeometry(bbox: BBox): Geometry {
		return bboxPolygon([
			bbox.topLeft.lon,
			bbox.topLeft.lat,
			bbox.bottomRight.lon,
			bbox.bottomRight.lat,
		]).geometry;
	}

	coordinateToPosition(lat: number, lon: number): Position;
	coordinateToPosition(coord: { lat: number; lon: number }): Position;
	coordinateToPosition(
		latOrCoord: number | { lat: number; lon: number },
		lon?: number,
	): Position {
		if (typeof latOrCoord === 'number' && typeof lon === 'number') {
			return [lon, latOrCoord];
		} else if (typeof latOrCoord === 'object') {
			return [latOrCoord.lon, latOrCoord.lat];
		}

		throw new Error('Invalid arguments');
	}
}
