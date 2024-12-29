import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseDocument } from '@kordis/api/shared';

@Schema({ collection: 'tetra-configs' })
export class TetraConfigDocument extends BaseDocument {
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
