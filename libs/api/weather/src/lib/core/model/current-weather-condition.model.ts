import { Field, ObjectType } from '@nestjs/graphql';

import { Pressure, Visibility, Wind } from './weather-shared.models';

@ObjectType()
export class CurrentWeatherCondition {
	@Field()
	uvIndexPhrase: string;
	@Field()
	hasPrecipitation: boolean;
	@Field()
	phrase: string;
	@Field(() => Visibility)
	visibility: Visibility;
	@Field()
	cloudCover: number;
	@Field()
	observationTime: Date;
	@Field(() => Pressure)
	pressure: Pressure;
	@Field()
	temperatureCelsius: number;
	@Field()
	iconFileName: string;
	@Field(() => Wind)
	wind: Wind;
}
