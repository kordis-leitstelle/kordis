import { Injectable } from '@nestjs/common';
import {
	Feature,
	Geometry,
	bboxPolygon,
	booleanOverlap,
	booleanWithin,
	distance,
	point,
} from '@turf/turf';

import { BBox } from '@kordis/api/shared';

import { GeospatialService } from '../core/geospatial.service';

@Injectable()
export class GeospatialServiceImpl implements GeospatialService {
	getMetersBetweenCoords(
		coord1: { lat: number; lon: number },
		coord2: { lat: number; lon: number },
	): number {
		return distance(
			point([coord1.lon, coord1.lat]),
			point([coord2.lon, coord2.lat]),
			{ units: 'meters' },
		);
	}

	isCompletelyWithin(
		possibleInner: Geometry | Feature,
		possibleOuter: Geometry | Feature,
	): boolean {
		return booleanWithin(possibleInner, possibleOuter);
	}

	isIntersecting(
		feature1: Geometry | Feature,
		feature2: Geometry | Feature,
	): boolean {
		return booleanOverlap(feature1, feature2);
	}

	bboxToGeometry(bbox: BBox): Geometry {
		return bboxPolygon([
			bbox.topLeft.lon,
			bbox.topLeft.lat,
			bbox.bottomRight.lon,
			bbox.bottomRight.lat,
		]).geometry;
	}
}
