import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'tetra-configs' })
export class TetraConfigDocument extends Document {
	@Prop({ unique: true })
	orgId: string;

	@Prop()
	tetraControlApiUrl: string;

	@Prop()
	tetraControlApiUserKey: string;

	@Prop({ index: true })
	webhookAccessKey: string;
}

export const TetraConfigSchema =
	SchemaFactory.createForClass(TetraConfigDocument);
