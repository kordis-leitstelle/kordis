import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	OperationAssignmentsUpdatedMessage,
	OperationAssignmentsUpdatedMessagePayload,
} from '../../core/entity/protocol-entries/operation/operation-involvements-updated-message.entity';
import {
	OperationAssignmentsUpdatedMessageDocument,
	OperationAssignmentsUpdatedMessagePayloadDocument,
} from '../../infra/schema/operation/operation-assignments-updated-message.schema';

@Injectable()
export class OperationMessageAssignmentsUpdatedEntityProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				OperationAssignmentsUpdatedMessageDocument,
				OperationAssignmentsUpdatedMessage,
			);
			createMap(
				mapper,
				OperationAssignmentsUpdatedMessagePayloadDocument,
				OperationAssignmentsUpdatedMessagePayload,
			);
		};
	}
}
