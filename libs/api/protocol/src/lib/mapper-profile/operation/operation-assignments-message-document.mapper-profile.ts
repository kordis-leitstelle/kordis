import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	OperationMessageAssignedAlertGroup,
	OperationMessageAssignedUnit,
} from '../../core/entity/protocol-entries/operation/operation-message.value-objects';
import {
	OperationMessageAssignedAlertGroupDocument,
	OperationMessageAssignedUnitDocument,
} from '../../infra/schema/operation/operation-assignment-message.schema';

@Injectable()
export class OperationMessageAssignmentsDocumentProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				OperationMessageAssignedUnit,
				OperationMessageAssignedUnitDocument,
			);
			createMap(
				mapper,
				OperationMessageAssignedAlertGroup,
				OperationMessageAssignedAlertGroupDocument,
			);
		};
	}
}
