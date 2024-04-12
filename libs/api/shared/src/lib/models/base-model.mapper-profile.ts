import {
	Mapper,
	MappingProfile,
	createMap,
	forMember,
	mapFrom,
} from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { BaseDocument } from './base-document.model';
import { BaseEntityModel } from './base-entity.model';

@Injectable()
export class BaseModelProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile(): MappingProfile {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				BaseDocument,
				BaseEntityModel,
				forMember(
					(d) => d.id,
					mapFrom((s) => s._id.toString()),
				),
			);
		};
	}
}
