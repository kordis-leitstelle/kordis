import { AutoMap } from '@automapper/classes';
import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { IsLatitude, IsLongitude } from 'class-validator';

@ObjectType()
@Schema()
@InputType('CoordinateInput')
export class Coordinate {
	@Field(() => Float)
	@Prop()
	@IsLatitude({ message: 'Der Wert muss ein gültiger Längengrad sein.' })
	@AutoMap()
	lat: number;

	@Field(() => Float)
	@Prop()
	@IsLongitude({ message: 'Der Wert muss ein gültiger Breitengrad sein.' })
	@AutoMap()
	lon: number;
}
