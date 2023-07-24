import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GeometryCollection } from '@turf/turf';
import JSON from 'graphql-type-json';

@ObjectType()
@Schema()
export class Warning {
	@Field()
	@Prop({ unique: true })
	sourceId: string;
	@Field()
	@Prop()
	sourceVersion: number;
	@Field()
	@Prop()
	sentAt: Date;
	@Field()
	@Prop()
	sender: string;
	@Field()
	@Prop()
	severity: string;
	@Field(() => Date, { nullable: true })
	@Prop({ type: Date, required: false })
	effective: Date | null;
	@Field(() => Date, { nullable: true })
	@Prop({ type: Date, required: false })
	expires: Date | null;
	@Field()
	@Prop()
	title: string;
	@Field()
	@Prop()
	description: string;
	@Field(() => String, { nullable: true })
	@Prop({ type: String, required: false })
	instruction: string | null;
	@Field(() => JSON)
	@Prop({
		type: Object,
		index: '2dsphere',
	})
	affectedLocations: GeometryCollection;
}

export const WarningSchema = SchemaFactory.createForClass(Warning);
