import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ProtocolEntryBaseDocument } from '../protocol-entry-base.schema';
import { ProtocolEntryType } from '../protocol-entry-type.enum';
import { RescueStationMessagePayloadDocument } from './rescue-station-message-payload.schema';

@Schema()
export class RescueStationUpdateMessageDocument extends ProtocolEntryBaseDocument {
	override type = ProtocolEntryType.RESCUE_STATION_UPDATE_ENTRY;

	@Prop()
	@AutoMap()
	declare payload: RescueStationMessagePayloadDocument;
}

export const RescueStationUpdateMessageSchema = SchemaFactory.createForClass(
	RescueStationUpdateMessageDocument,
);
