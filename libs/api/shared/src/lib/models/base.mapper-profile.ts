import {
	MappingConfiguration,
	createMap,
	extend,
	forMember,
	mapFrom,
} from '@automapper/core';
import { AutomapperProfile } from '@automapper/nestjs';

import { BaseDocument } from './base-document.model';
import { BaseEntityModel } from './base-entity.model';

export abstract class BaseMapperProfile extends AutomapperProfile {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [
			extend(
				createMap(
					this.mapper,
					BaseDocument,
					BaseEntityModel,
					forMember(
						(d) => d.id,
						mapFrom((s) => s._id?.toString()),
					),
				),
			),
		];
	}
}
