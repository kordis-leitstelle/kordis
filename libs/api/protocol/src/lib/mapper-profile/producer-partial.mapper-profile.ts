import type { Mapper } from '@automapper/core';
import { createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	SystemProducer,
	UserProducer,
} from '../core/entity/partials/producer-partial.entity';
import {
	SystemProducerDocument,
	UserProducerDocument,
} from '../infra/schema/producer-partial.schema';

@Injectable()
export class ProducerPartialProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			// document --> entity
			createMap(mapper, UserProducerDocument, UserProducer);
			createMap(mapper, SystemProducerDocument, SystemProducer);

			// entity --> document
			createMap(mapper, UserProducer, UserProducerDocument);
			createMap(mapper, SystemProducer, SystemProducerDocument);
		};
	}
}
