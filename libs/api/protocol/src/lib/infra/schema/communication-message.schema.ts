import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
	ProtocolCommunicationEntryBaseDocument,
	ProtocolEntryType,
} from './protocol-entry-base.schema';

@Schema({ _id: false })
export class CommunicationMessagePayloadDocument {
	@Prop()
	@AutoMap()
	message: string;
}

@Schema()
export class CommunicationMessageDocument extends ProtocolCommunicationEntryBaseDocument {
	override type = ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY;

	@Prop()
	@AutoMap()
	payload: CommunicationMessagePayloadDocument;
}

export const CommunicationMessageSchema = SchemaFactory.createForClass(
	CommunicationMessageDocument,
);
