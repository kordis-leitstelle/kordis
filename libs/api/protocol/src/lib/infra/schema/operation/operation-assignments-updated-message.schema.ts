import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ProtocolEntryBaseDocument } from '../protocol-entry-base.schema';
import { ProtocolEntryType } from '../protocol-entry-type.enum';
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
export class OperationAssignmentsUpdatedMessageDocument extends ProtocolEntryBaseDocument {
	override type = ProtocolEntryType.OPERATION_ASSIGNMENTS_UPDATED_ENTRY;

	@Prop()
	@AutoMap()
	declare payload: OperationAssignmentsUpdatedMessagePayloadDocument;
}

export const OperationAssignmentsUpdatedMessageSchema =
	SchemaFactory.createForClass(OperationAssignmentsUpdatedMessageDocument);
