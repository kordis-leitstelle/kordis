import { Field, ObjectType } from '@nestjs/graphql';

import { Precipitation, ValueUnit, Wind } from './weather-shared.models';

@ObjectType()
export class HourlyWeatherForecast {
	@Field(() => [HourlyWeatherForecastEntry])
	forecasts: HourlyWeatherForecastEntry[];
}

@ObjectType()
export class HourlyWeatherForecastEntry {
	@Field()
	date: Date;
	@Field()
	uvIndexPhrase: string;
	@Field(() => Precipitation)
	rain: Precipitation;
	@Field(() => ValueUnit)
	visibility: ValueUnit;
	@Field(() => Precipitation)
	snow: Precipitation;
	@Field(() => Precipitation)
	ice: Precipitation;
	@Field()
	temperatureCelsius: number;
	@Field()
	iconFileName: string;
	@Field(() => Wind)
	wind: Wind;
}
