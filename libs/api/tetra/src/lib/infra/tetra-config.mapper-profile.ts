import type { Mapper } from '@automapper/core';
import { createMap, forMember, mapFrom } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { TetraConfig } from '../core/entity/tetra-config.entitiy';
import { TetraConfigDocument } from './schema/tetra-config.schema';

@Injectable()
export class TetraConfigMapperProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				TetraConfigDocument,
				TetraConfig,
				forMember(
					(d) => d.orgId,
					mapFrom((s) => s.orgId),
				),
				forMember(
					(d) => d.url,
					mapFrom((s) => s.url),
				),
				forMember(
					(d) => d.userKey,
					mapFrom((s) => s.userKey),
				),
				forMember(
					(d) => d.webhookAccessKey,
					mapFrom((s) => s.webhookAccessKey),
				),
			);
		};
	}
}
