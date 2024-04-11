import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'tetra-configs' })
export class TetraConfigDocument extends Document {
	@Prop({ unique: true })
	@AutoMap()
	orgId: string;

	@Prop()
	@AutoMap()
	tetraControlApiUrl: string;

	@Prop()
	@AutoMap()
	tetraControlApiUserKey: string;

	@Prop({ index: true })
	@AutoMap()
	webhookAccessKey: string;
}

export const TetraConfigSchema =
	SchemaFactory.createForClass(TetraConfigDocument);
