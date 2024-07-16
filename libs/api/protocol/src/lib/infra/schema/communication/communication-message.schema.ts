import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ProtocolMessageEntryBaseDocument } from '../protocol-entry-base.schema';
import { ProtocolEntryType } from '../protocol-entry-type';

@Schema({ _id: false })
export class CommunicationMessagePayloadDocument {
	@Prop()
	@AutoMap()
	message: string;
}

@Schema()
export class CommunicationMessageDocument extends ProtocolMessageEntryBaseDocument {
	override type = ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY;

	@Prop()
	@AutoMap()
	payload: CommunicationMessagePayloadDocument;
}

export const CommunicationMessageSchema = SchemaFactory.createForClass(
	CommunicationMessageDocument,
);
