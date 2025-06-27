import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseDocument } from '@kordis/api/shared';

import { AlertingProviders } from './alerting-org-config.schema';

@Schema({
	discriminatorKey: 'type',
	timestamps: true,
	collection: 'alert-group-config',
})
export class AlertGroupConfigBaseDocument extends BaseDocument {
	type: AlertingProviders;

	@Prop()
	@AutoMap()
	alertGroupId: string;
}

export const AlertGroupConfigBaseSchema = SchemaFactory.createForClass(
	AlertGroupConfigBaseDocument,
);

AlertGroupConfigBaseSchema.index({
	orgId: 1,
	alertGroupId: 1,
});

@Schema()
export class AlertGroupDiveraConfigDocument extends AlertGroupConfigBaseDocument {
	@Prop()
	@AutoMap()
	diveraGroupId: string;
}

export const AlertGroupDiveraConfigSchema = SchemaFactory.createForClass(
	AlertGroupDiveraConfigDocument,
);
