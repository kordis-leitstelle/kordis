import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
	ProtocolEntryType,
	ProtocolMessageEntryBaseDocument,
} from '../protocol-entry-base.schema';
import { RescueStationMessagePayloadDocument } from './rescue-station-message-payload.schema';

@Schema()
export class RescueStationSignOnMessageDocument extends ProtocolMessageEntryBaseDocument {
	override type = ProtocolEntryType.RESCUE_STATION_SIGN_ON_ENTRY;

	@Prop()
	@AutoMap()
	payload: RescueStationMessagePayloadDocument;
}

export const RescueStationSignOnMessageSchema = SchemaFactory.createForClass(
	RescueStationSignOnMessageDocument,
);
