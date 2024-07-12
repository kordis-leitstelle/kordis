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
export class RescueStationMessagePayloadProfile extends AutomapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationMessagePayloadDocument,
				RescueStationMessagePayload,
			);
			createMap(
				mapper,
				RescueStationMessageStrengthDocument,
				RescueStationMessageStrength,
			);
			createMap(
				mapper,
				RescueStationMessageAssignedUnitDocument,
				RescueStationMessageAssignedUnit,
			);
			createMap(
				mapper,
				RescueStationMessageAssignedAlertGroupDocument,
				RescueStationMessageAssignedAlertGroup,
			);
		};
	}
}
