import type { Mapper } from '@automapper/core';
import { createMap, forMember, mapFrom } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { BaseMapperProfile } from '@kordis/api/shared';

import { Organization as OrganizationEntity } from '../core/entity/organization.entity';
import { OrganizationDocument } from './schema/organization.schema';

@Injectable()
export class OrganizationProfile extends BaseMapperProfile {
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
			);
		};
	}
}
