import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseDocument } from '@kordis/api/shared';

export enum AlertingProviders {
	DIVERA = 'DIVERA',
	MOCK = 'MOCK',
}

@Schema({
	discriminatorKey: 'type',
	timestamps: true,
	collection: 'alerting-org-config',
})
export class AlertOrgConfigBaseDocument extends BaseDocument {
	@Prop({ type: String, enum: Object.values(AlertingProviders) })
	type: AlertingProviders;
}

export const AlertingOrgConfigBaseSchema = SchemaFactory.createForClass(
	AlertOrgConfigBaseDocument,
);

@Schema()
export class DiveraOrgConfigDocument extends AlertOrgConfigBaseDocument {
	override type = AlertingProviders.DIVERA;

	@Prop()
	@AutoMap()
	token: string;
}

export const DiveraConfigSchema = SchemaFactory.createForClass(
	DiveraOrgConfigDocument,
);
