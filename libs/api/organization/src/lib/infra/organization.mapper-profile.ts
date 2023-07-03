import type { Mapper } from '@automapper/core';
import { createMap, forMember, mapFrom } from '@automapper/core';
import { Inject, Injectable } from '@nestjs/common';
import {
	AutomapperProfile,
	getMapperToken,
} from '@timonmasberg/automapper-nestjs';

import { Organization as OrganizationEntity } from '../core/entity/organization.entity';
import { OrganizationDocument } from './schema/organization.schema';

@Injectable()
export class OrganizationProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				OrganizationDocument,
				OrganizationEntity,
				forMember(
					(d) => d.name,
					mapFrom((s) => s.name),
				),
				forMember(
					(d) => d.geoSettings,
					mapFrom((s) => s.geoSettings),
				),
				forMember(
					(d) => d.id,
					mapFrom((s) => s._id.toString()),
				),
			);
		};
	}
}
