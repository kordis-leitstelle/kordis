import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';

import { ProtocolMessageEntryBase } from '../protocol-entry-base.entity';
import { RescueStationMessagePayload } from './rescue-station-message-payload.entity';

@ObjectType()
export class RescueStationUpdateMessage extends ProtocolMessageEntryBase {
	@Field(() => RescueStationMessagePayload)
	@AutoMap()
	payload: RescueStationMessagePayload;
}
