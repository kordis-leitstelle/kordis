import type { Mapper } from '@automapper/core';
import {
	constructUsing,
	createMap,
	forMember,
	mapWith,
} from '@automapper/core';
import { Inject, Injectable } from '@nestjs/common';
import {
	AutomapperProfile,
	getMapperToken,
} from '@timonmasberg/automapper-nestjs';
import { point } from '@turf/turf';

import {
	ShipPositionFeature,
	ShipPositionFeatureProperties,
} from '../core/entity/ship-position.entity';
import { HPAShipPositionDocument } from './schema/hpa-ship-position.schema';

@Injectable()
export class ShipPositionMapperProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, HPAShipPositionDocument, ShipPositionFeatureProperties);

			createMap(
				mapper,
				HPAShipPositionDocument,
				ShipPositionFeature,
				constructUsing(
					(sourceObject) =>
						point([
							sourceObject.longitude,
							sourceObject.latitude,
						]) as ShipPositionFeature,
				),
				forMember(
					(destinationObject) => destinationObject.properties,
					mapWith(
						ShipPositionFeatureProperties,
						HPAShipPositionDocument,
						(sourceObject) => sourceObject,
					),
				),
			);
		};
	}
}
