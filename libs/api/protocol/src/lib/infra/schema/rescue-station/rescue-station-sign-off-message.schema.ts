import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ProtocolEntryBaseDocument } from '../protocol-entry-base.schema';
import { ProtocolEntryType } from '../protocol-entry-type.enum';

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
export class RescueStationSignOffMessageDocument extends ProtocolEntryBaseDocument {
	override type = ProtocolEntryType.RESCUE_STATION_SIGN_OFF_ENTRY;

	@Prop()
	@AutoMap()
	declare payload: RescueStationSignOffMessagePayloadDocument;
}

export const RescueStationSignOffMessageSchema = SchemaFactory.createForClass(
	RescueStationSignOffMessageDocument,
);
