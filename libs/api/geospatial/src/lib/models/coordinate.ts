import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { IsLatitude, IsLongitude } from 'class-validator';

@ObjectType()
@InputType('CoordinateInput')
export class Coordinate {
	@IsLatitude({ message: 'Der Wert muss ein gültiger Längengrad sein.' })
	@Field(() => Float)
	lat: number;

	@IsLongitude({ message: 'Der Wert muss ein gültiger Breitengrad sein.' })
	@Field(() => Float)
	lon: number;
}
