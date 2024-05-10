import type { Mapper } from '@automapper/core';
import { createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	RegisteredUnit,
	Unit,
	UnknownUnit,
} from '../core/entity/partials/unit-partial.entity';
import {
	RegisteredUnitDocument,
	UnitDocument,
	UnitType,
	UnknownUnitDocument,
} from '../infra/schema/unit-partial.schema';

export const unitDocumentToEntityMapper = (
	mapper: Mapper,
	unitDocument: UnitDocument,
): RegisteredUnit | UnknownUnit => {
	// since the object returned by Mongoose is a pojo rather than an instance of `UnitDocument`,
	// we discriminate via the `type` field rather than `instanceof`
	switch (unitDocument.type) {
		case UnitType.UNKNOWN_UNIT:
			return mapper.map(unitDocument, UnknownUnitDocument, UnknownUnit);
		case UnitType.REGISTERED_UNIT:
			return mapper.map(unitDocument, RegisteredUnitDocument, RegisteredUnit);
		default:
			throw new Error(
				`UnitDocument type ${unitDocument.type} not supported by mapper`,
			);
	}
};

export const unitEntityToDocumentMapper = (
	mapper: Mapper,
	unitEntity: Unit,
): RegisteredUnitDocument | UnknownUnitDocument => {
	switch (true) {
		case unitEntity instanceof RegisteredUnit:
			return mapper.map(unitEntity, RegisteredUnit, RegisteredUnitDocument);
		case unitEntity instanceof UnknownUnit:
			return mapper.map(unitEntity, UnknownUnit, UnknownUnitDocument);
		default:
			throw new Error(
				`Unit type ${unitEntity.constructor.name} not supported by mapper`,
			);
	}
};

@Injectable()
export class UnitPartialProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			// document --> entity
			createMap(mapper, RegisteredUnitDocument, RegisteredUnit);
			createMap(mapper, UnknownUnitDocument, UnknownUnit);

			// entity --> document
			createMap(mapper, RegisteredUnit, RegisteredUnitDocument);
			createMap(mapper, UnknownUnit, UnknownUnitDocument);
		};
	}
}
