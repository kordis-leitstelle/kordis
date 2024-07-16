import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ProtocolMessageEntryBaseDocument } from '../protocol-entry-base.schema';
import { ProtocolEntryType } from '../protocol-entry-type';
import { RescueStationMessagePayloadDocument } from './rescue-station-message-payload.schema';

@Schema()
export class RescueStationUpdateMessageDocument extends ProtocolMessageEntryBaseDocument {
	override type = ProtocolEntryType.RESCUE_STATION_UPDATE_ENTRY;

	@Prop()
	@AutoMap()
	payload: RescueStationMessagePayloadDocument;
}

export const RescueStationUpdateMessageSchema = SchemaFactory.createForClass(
	RescueStationUpdateMessageDocument,
);
