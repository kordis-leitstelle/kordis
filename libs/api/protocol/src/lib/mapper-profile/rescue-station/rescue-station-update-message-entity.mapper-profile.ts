import { Mapper, createMap } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { RescueStationUpdateMessage } from '../../core/entity/protocol-entries/rescue-station/rescue-station-update-message.entity';
import { RescueStationUpdateMessageDocument } from '../../infra/schema/rescue-station/rescue-station-updated-message.schema';
import { ProtocolMessageEntryBaseProfile } from '../protocol-entity.mapper-profile';

@Injectable()
export class RescueStationUpdateMessageEntityProfile extends ProtocolMessageEntryBaseProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationUpdateMessageDocument,
				RescueStationUpdateMessage,
			);
		};
	}
}
