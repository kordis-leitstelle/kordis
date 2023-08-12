import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface ShipPosition {
	comparableHash?: string; // this is being used to compare if a new report includes data that is new to cached data
	mmsi: string;
	createdAt: Date;
	callSign?: string;
	name?: string;
	length?: number;
	width?: number;
	latitude: number;
	longitude: number;
	heading?: number;
	sog?: number;
	cog?: number;
	turningRate?: number;
	class?: string;
	subClass?: string;
}

@Schema({ collection: 'hpaShipPositions' })
export class HPAShipPositionDocument implements ShipPosition {
	@Prop()
	comparableHash: string;
	@Prop({ unique: true })
	@AutoMap()
	mmsi: string;
	@Prop()
	@AutoMap()
	createdAt: Date;
	@Prop()
	@AutoMap()
	callSign: string;
	@Prop()
	@AutoMap()
	name?: string;
	@Prop()
	@AutoMap()
	length?: number;
	@Prop()
	@AutoMap()
	width?: number;
	@Prop()
	latitude: number;
	@Prop()
	longitude: number;
	@Prop()
	@AutoMap()
	heading?: number;
	@Prop()
	@AutoMap()
	sog?: number;
	@Prop()
	@AutoMap()
	cog?: number;
	@Prop()
	@AutoMap()
	turningRate?: number;
	@Prop()
	@AutoMap()
	class: string;
	@Prop()
	@AutoMap()
	subClass: string;
}

export const HpaShipPositionSchema = SchemaFactory.createForClass(
	HPAShipPositionDocument,
);

HpaShipPositionSchema.index(
	{ createdAt: 1 },
	{ expireAfterSeconds: 604800 }, // 7 days
);
HpaShipPositionSchema.index({ name: 'text', mmsi: 'text', callSign: 'text' });
HpaShipPositionSchema.index({ name: 1 });
HpaShipPositionSchema.index({ callSign: 1 });
