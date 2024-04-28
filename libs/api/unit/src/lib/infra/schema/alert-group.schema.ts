import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { BaseDocument } from '@kordis/api/shared';

import { UnitDocument } from './unit.schema';

@Schema({ timestamps: true, collection: 'alert-groups' })
export class AlertGroupDocument extends BaseDocument {
	@Prop()
	@AutoMap()
	name: string;

	@Prop({ type: [Types.ObjectId], ref: 'UnitDocument' })
	@AutoMap(() => [UnitDocument])
	units: UnitDocument[] | Types.ObjectId[];
}

export const AlertGroupSchema =
	SchemaFactory.createForClass(AlertGroupDocument);
