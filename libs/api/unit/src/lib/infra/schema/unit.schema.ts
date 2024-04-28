import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseDocument } from '@kordis/api/shared';

import { PersistentUnitStatus } from '../../core/entity/status.type';

@Schema()
export class UnitStatus {
	@Prop({ type: Number })
	@AutoMap(() => Number)
	status: PersistentUnitStatus;

	@Prop(() => Date)
	@AutoMap()
	receivedAt: Date;

	@Prop()
	@AutoMap()
	source: string;
}

const UnitStatusSchema = SchemaFactory.createForClass(UnitStatus);

@Schema()
export class FurtherAttribute {
	@Prop()
	@AutoMap()
	name: string;

	@Prop()
	@AutoMap()
	value: string;
}

const FurtherAttributeSchema = SchemaFactory.createForClass(FurtherAttribute);

@Schema({ timestamps: true, collection: 'units' })
export class UnitDocument extends BaseDocument {
	@Prop()
	@AutoMap()
	name: string;

	@Prop({ default: null, type: UnitStatusSchema })
	@AutoMap(() => UnitStatus)
	status: UnitStatus | null;

	@Prop()
	@AutoMap()
	note: string;

	@Prop()
	@AutoMap()
	department: string;

	@Prop()
	@AutoMap()
	rcsId: string;

	@Prop()
	@AutoMap()
	callSign: string;

	@Prop()
	@AutoMap()
	callSignAbbreviation: string;

	@Prop({ type: [FurtherAttributeSchema] })
	@AutoMap()
	furtherAttributes: FurtherAttribute[];
}

export const UnitSchema = SchemaFactory.createForClass(UnitDocument);

UnitSchema.index({ orgId: 1, rcsId: 1 }, { unique: true });
