import type { Mapper, MappingProfile } from '@automapper/core';
import { createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { BaseMapperProfile, Coordinate } from '@kordis/api/shared';

import {
	BBox as BBoxEntity,
	Organization as OrganizationEntity,
	OrganizationGeoSettings as OrganizationGeoSettingsEntity,
} from '../core/entity/organization.entity';
import {
	BBox as BBoxDocument,
	OrganizationDocument,
	OrganizationGeoSettings as OrganizationGeoSettingsDocument,
} from './schema/organization.schema';

@Injectable()
export class OrganizationValueObjectsProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	get profile(): MappingProfile {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				OrganizationGeoSettingsDocument,
				OrganizationGeoSettingsEntity,
			);
			createMap(mapper, BBoxDocument, BBoxEntity);
			createMap(mapper, Coordinate, Coordinate);
		};
	}
}

@Injectable()
export class OrganizationProfile extends BaseMapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, OrganizationDocument, OrganizationEntity);
		};
	}
}
