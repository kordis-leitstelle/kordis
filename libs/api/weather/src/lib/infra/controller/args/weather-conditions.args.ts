import { ArgsType, Field, Float } from '@nestjs/graphql';
import { IsLatitude, IsLongitude } from 'class-validator';

@ArgsType()
export class WeatherConditionsArgs {
	@Field(() => Float)
	@IsLatitude()
	latitude: number;

	@Field(() => Float)
	@IsLongitude()
	longitude: number;
}
