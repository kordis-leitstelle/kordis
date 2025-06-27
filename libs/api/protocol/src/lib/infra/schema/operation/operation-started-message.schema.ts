import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ProtocolEntryBaseDocument } from '../protocol-entry-base.schema';
import { ProtocolEntryType } from '../protocol-entry-type.enum';
import {
	OperationMessageAssignedAlertGroupDocument,
	OperationMessageAssignedUnitDocument,
} from './operation-assignment-message.schema';

@Schema({ _id: false })
export class OperationStartedMessageLocationDocument {
	@Prop()
	@AutoMap()
	name: string;

	@Prop()
	@AutoMap()
	street: string;

	@Prop()
	@AutoMap()
	city: string;

	@Prop()
	@AutoMap()
	postalCode: string;
}

@Schema({ _id: false })
export class OperationStartedMessagePayloadDocument {
	@Prop()
	@AutoMap()
	operationId: string;

	@Prop()
	@AutoMap()
	operationSign: string;

	@Prop()
	@AutoMap()
	location: OperationStartedMessageLocationDocument;

	@Prop()
	@AutoMap()
	alarmKeyword: string;

	@Prop()
	@AutoMap(() => [OperationMessageAssignedUnitDocument])
	assignedUnits: OperationMessageAssignedUnitDocument[];

	@Prop()
	@AutoMap(() => [OperationMessageAssignedAlertGroupDocument])
	assignedAlertGroups: OperationMessageAssignedAlertGroupDocument[];
}

@Schema()
export class OperationStartedMessageDocument extends ProtocolEntryBaseDocument {
	override type = ProtocolEntryType.OPERATION_STARTED_ENTRY;

	@Prop()
	@AutoMap()
	declare payload: OperationStartedMessagePayloadDocument;
}

export const OperationStartedMessageSchema = SchemaFactory.createForClass(
	OperationStartedMessageDocument,
);
