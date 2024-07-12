import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import {
	RescueStationMessageAssignedAlertGroup,
	RescueStationMessageAssignedUnit,
	RescueStationMessagePayload,
	RescueStationMessageStrength,
} from '../../core/entity/protocol-entries/rescue-station/rescue-station-message-payload.entity';
import {
	RescueStationMessageAssignedAlertGroupDocument,
	RescueStationMessageAssignedUnitDocument,
	RescueStationMessagePayloadDocument,
	RescueStationMessageStrengthDocument,
} from '../../infra/schema/rescue-station/rescue-station-message-payload.schema';

@Injectable()
export class RescueStationMessagePayloadDocumentProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationMessagePayload,
				RescueStationMessagePayloadDocument,
			);
			createMap(
				mapper,
				RescueStationMessageStrength,
				RescueStationMessageStrengthDocument,
			);
			createMap(
				mapper,
				RescueStationMessageAssignedUnit,
				RescueStationMessageAssignedUnitDocument,
			);
			createMap(
				mapper,
				RescueStationMessageAssignedAlertGroup,
				RescueStationMessageAssignedAlertGroupDocument,
			);
		};
	}
}
