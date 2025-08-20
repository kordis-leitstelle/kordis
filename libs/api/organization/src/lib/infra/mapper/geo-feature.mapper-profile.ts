import { Mapper, createMap } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { GeoFeature } from '../../core/entity/geo-features.entity';
import { GeoFeatureDocument } from '../schema/geo-feature.schema';

@Injectable()
export class GeoFeatureProfile {
	constructor(@Inject(getMapperToken()) private readonly mapper: Mapper) {
		this.configureMapping(this.mapper);
	}

	private configureMapping(mapper: Mapper): void {
		createMap(mapper, GeoFeature, GeoFeatureDocument);
		createMap(mapper, GeoFeatureDocument, GeoFeature);
	}
}
