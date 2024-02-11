import { Injectable } from '@nestjs/common';
import {
	Feature,
	Geometry,
	Position,
	booleanDisjoint,
	distance,
} from '@turf/turf';

import { GeospatialService } from '../core/geospatial.service';

@Injectable()
export class GeospatialServiceImpl implements GeospatialService {
	getMetersBetweenCoords(coord1: Position, coord2: Position): number {
		return distance(coord1, coord2, { units: 'meters' });
	}

	isIntersecting(
		feature1: Geometry | Feature,
		feature2: Geometry | Feature,
	): boolean {
		return !booleanDisjoint(feature1, feature2);
	}
}
