import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';

import { ProtocolEntryBase } from '../protocol-entry.entity';

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
export class RescueStationSignOffMessage extends ProtocolEntryBase {
	@Field(() => RescueStationSignOffMessagePayload)
	@AutoMap()
	declare payload: RescueStationSignOffMessagePayload;
}
