import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { BaseMapperProfile } from '@kordis/api/shared';

import {
	FurtherAttribute,
	FurtherAttribute as FurtherAttributeValueObject,
	UnitEntity,
	UnitStatus as UnitStatusValueObject,
} from '../../core/entity/unit.entity';
import { UnitDocument, UnitStatus } from '../schema/unit.schema';

@Injectable()
export class UnitValueObjectProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, UnitStatus, UnitStatusValueObject);
			createMap(mapper, FurtherAttribute, FurtherAttributeValueObject);
		};
	}
}

@Injectable()
export class UnitProfile extends BaseMapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, UnitDocument, UnitEntity);
		};
	}
}
