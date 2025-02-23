import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ProtocolMessageEntryBaseDocument } from '../protocol-entry-base.schema';
import { ProtocolEntryType } from '../protocol-entry-type';
import { OperationStartedMessagePayloadDocument } from './operation-started-message.schema';

@Schema({ _id: false })
export class OperationEndedMessagePayloadDocument {
	@Prop()
	@AutoMap()
	operationId: string;

	@Prop()
	@AutoMap()
	operationSign: string;
}

@Schema()
export class OperationEndedMessageDocument extends ProtocolMessageEntryBaseDocument {
	override type = ProtocolEntryType.OPERATION_ENDED_ENTRY;

	@Prop()
	@AutoMap()
	payload: OperationStartedMessagePayloadDocument;
}

export const OperationEndedMessageSchema = SchemaFactory.createForClass(
	OperationEndedMessageDocument,
);
