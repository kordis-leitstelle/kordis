import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ProtocolEntryBaseDocument } from '../protocol-entry-base.schema';
import { ProtocolEntryType } from '../protocol-entry-type.enum';

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
export class OperationEndedMessageDocument extends ProtocolEntryBaseDocument {
	override type = ProtocolEntryType.OPERATION_ENDED_ENTRY;

	@Prop()
	@AutoMap()
	declare payload: OperationEndedMessagePayloadDocument;
}

export const OperationEndedMessageSchema = SchemaFactory.createForClass(
	OperationEndedMessageDocument,
);
