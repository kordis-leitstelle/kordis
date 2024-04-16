import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseDocument } from '@kordis/api/shared';

@Schema({ timestamps: true, collection: 'operations' })
export class OperationDocument extends BaseDocument {
	@AutoMap()
	@Prop()
	sign: string;

	@AutoMap()
	@Prop()
	start: Date;

	@AutoMap()
	@Prop({ default: null, type: Date })
	end: Date | null;
}

export const OperationSchema = SchemaFactory.createForClass(OperationDocument);
OperationSchema.index({ orgId: 1, sign: 1 });
