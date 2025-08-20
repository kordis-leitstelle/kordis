import { AutoMap } from '@automapper/classes';
import { Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { BaseDocument, Coordinate } from '@kordis/api/shared';

@Schema({
	collection: 'geo-features',
	timestamps: true,
})
export class GeoFeatureDocument extends BaseDocument {
	@ValidateNested()
	@Type(() => Coordinate)
	@Field()
	@AutoMap()
	coordinate: Coordinate;

	@Prop({ type: String })
	@AutoMap()
	name: string;

	@Prop({ type: String })
	@AutoMap()
	street: string;

	@Prop({ type: String, required: true })
	@AutoMap()
	city: string;

	@Prop({ type: String, required: true })
	@AutoMap()
	postalCode: string;
}

export const GeoFeatureSchema =
	SchemaFactory.createForClass(GeoFeatureDocument);
