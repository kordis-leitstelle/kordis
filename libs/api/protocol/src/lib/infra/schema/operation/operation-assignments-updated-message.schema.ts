import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
	ProtocolEntryType,
	ProtocolMessageEntryBaseDocument,
} from '../protocol-entry-base.schema';
import {
	OperationMessageAssignedAlertGroupDocument,
	OperationMessageAssignedUnitDocument,
} from './operation-assignment-message.schema';

@Schema({ _id: false })
export class OperationAssignmentsUpdatedMessagePayloadDocument {
	@Prop()
	@AutoMap()
	operationId: string;

	@Prop()
	@AutoMap()
	operationSign: string;

	@Prop()
	@AutoMap(() => [OperationMessageAssignedUnitDocument])
	assignedUnits: OperationMessageAssignedUnitDocument[];

	@Prop()
	@AutoMap(() => [OperationMessageAssignedAlertGroupDocument])
	assignedAlertGroups: OperationMessageAssignedAlertGroupDocument[];
}

@Schema()
export class OperationAssignmentsUpdatedMessageDocument extends ProtocolMessageEntryBaseDocument {
	override type = ProtocolEntryType.OPERATION_ASSIGNMENTS_UPDATED_ENTRY;

	@Prop()
	@AutoMap()
	payload: OperationAssignmentsUpdatedMessagePayloadDocument;
}

export const OperationAssignmentsUpdatedMessageSchema =
	SchemaFactory.createForClass(OperationAssignmentsUpdatedMessageDocument);
