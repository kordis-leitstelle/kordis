import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';

import { ProtocolMessageEntryBase } from '../protocol-entry-base.entity';

@ObjectType()
export class RescueStationSignOffMessagePayload {
	@Field()
	@AutoMap()
	rescueStationId: string;

	@Field()
	@AutoMap()
	rescueStationName: string;

	@Field()
	@AutoMap()
	rescueStationCallSign: string;
}

@ObjectType()
export class RescueStationSignOffMessage extends ProtocolMessageEntryBase {
	@Field(() => RescueStationSignOffMessagePayload)
	@AutoMap()
	payload: RescueStationSignOffMessagePayload;
}
