import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { OperationDocument } from './operation.schema';

export class InvolvementTimeDocument {
	@Prop({ type: Date })
	start: Date;

	@Prop({ default: null, nullable: true, type: Date })
	end: Date | null;
}

@Schema({ collection: 'operation-involvements' })
export class OperationInvolvementDocument {
	@Prop()
	orgId: string;

	@Prop({ type: Types.ObjectId, ref: 'OperationDocument' })
	operation: OperationDocument | Types.ObjectId;

	@Prop()
	unitId: string;

	@Prop({ type: String, nullable: true, default: null })
	alertGroupId: string | null;

	@Prop({ type: [InvolvementTimeDocument], default: [] })
	involvementTimes: InvolvementTimeDocument[];

	@Prop({ default: false })
	isPending: boolean;

	@Prop({ default: false })
	isDeleted?: boolean;
}

export const OperationInvolvementSchema = SchemaFactory.createForClass(
	OperationInvolvementDocument,
);

OperationInvolvementSchema.index(
	{ orgId: 1, unitId: 1, operation: 1 },
	{ unique: true },
);
OperationInvolvementSchema.index({ orgId: 1, unitId: 1 });
OperationInvolvementSchema.index({ orgId: 1, operation: 1 });
OperationInvolvementSchema.index({ orgId: 1, alertGroupId: 1 });
OperationInvolvementSchema.index({
	orgId: 1,
	unitId: 1,
	'involvementTimes.start': 1,
	'involvementTimes.end': 1,
});
