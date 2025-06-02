import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ProtocolEntryBaseDocument } from '../protocol-entry-base.schema';
import { ProtocolEntryType } from '../protocol-entry-type.enum';

@Schema({ _id: false })
export class CommunicationMessagePayloadDocument {
	@Prop()
	@AutoMap()
	message: string;
}

@Schema()
export class CommunicationMessageDocument extends ProtocolEntryBaseDocument {
	override type = ProtocolEntryType.COMMUNICATION_MESSAGE_ENTRY;

	@Prop()
	@AutoMap()
	declare payload: CommunicationMessagePayloadDocument;
}

export const CommunicationMessageSchema = SchemaFactory.createForClass(
	CommunicationMessageDocument,
);
