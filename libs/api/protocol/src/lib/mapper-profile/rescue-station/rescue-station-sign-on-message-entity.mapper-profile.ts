import { Mapper, createMap } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { RescueStationSignOnMessage } from '../../core/entity/protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { RescueStationSignOnMessageDocument } from '../../infra/schema/rescue-station/rescue-station-sign-on-message.schema';
import { ProtocolMessageEntryBaseProfile } from '../protocol-entity.mapper-profile';

@Injectable()
export class RescueStationSignOnMessageEntityProfile extends ProtocolMessageEntryBaseProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(
				mapper,
				RescueStationSignOnMessageDocument,
				RescueStationSignOnMessage,
			);
		};
	}
}
