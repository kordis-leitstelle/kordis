import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';

import { ProtocolEntryBase } from '../protocol-entry.entity';
import { RescueStationMessagePayload } from './rescue-station-message-payload.entity';

@ObjectType()
export class RescueStationSignOnMessage extends ProtocolEntryBase {
	@Field(() => RescueStationMessagePayload)
	@AutoMap()
	declare payload: RescueStationMessagePayload;
}
