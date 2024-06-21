import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
	ProtocolEntryType,
	ProtocolMessageEntryBaseDocument,
} from '../protocol-entry-base.schema';

@Schema({ _id: false })
export class RescueStationSignOffMessagePayloadDocument {
	@Prop()
	@AutoMap()
	rescueStationId: string;

	@Prop()
	@AutoMap()
	rescueStationName: string;

	@Prop()
	@AutoMap()
	rescueStationCallSign: string;
}

@Schema()
export class RescueStationSignOffMessageDocument extends ProtocolMessageEntryBaseDocument {
	override type = ProtocolEntryType.RESCUE_STATION_SIGN_OFF_ENTRY;

	@Prop()
	@AutoMap()
	payload: RescueStationSignOffMessagePayloadDocument;
}

export const RescueStationSignOffMessageSchema = SchemaFactory.createForClass(
	RescueStationSignOffMessageDocument,
);
