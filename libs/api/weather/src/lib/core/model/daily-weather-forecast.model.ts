import { Field, ObjectType, OmitType } from '@nestjs/graphql';

import { Precipitation, Wind } from './weather-shared.models';

@ObjectType()
export class PartOfDayPrecipitation extends Precipitation {
	@Field()
	hours: number;
}

@ObjectType()
export class PartOfDayWind extends OmitType(Wind, ['gustSpeed'] as const) {}

@ObjectType()
export class PartOfDayWeatherCondition {
	@Field(() => PartOfDayPrecipitation)
	rain: PartOfDayPrecipitation;
	@Field(() => PartOfDayPrecipitation)
	snow: PartOfDayPrecipitation;
	@Field(() => PartOfDayPrecipitation)
	ice: PartOfDayPrecipitation;
	@Field(() => PartOfDayWind)
	windGust: PartOfDayWind;
	@Field()
	thunderstormProbability: number;
	@Field()
	longPhrase: string;
	@Field()
	cloudCover: number;
	@Field()
	shortPhrase: string;
	@Field()
	iconFileName: string;
	@Field(() => PartOfDayWind)
	wind: PartOfDayWind;
}

@ObjectType()
export class DailyWeatherForecastEntry {
	@Field()
	date: Date;
	@Field()
	minTemperatureCelsius: number;
	@Field()
	maxTemperatureCelsius: number;
	@Field(() => PartOfDayWeatherCondition)
	night: PartOfDayWeatherCondition;
	@Field(() => PartOfDayWeatherCondition)
	day: PartOfDayWeatherCondition;
}

@ObjectType()
export class DailyWeatherForecast {
	@Field()
	summaryPhrase: string;
	@Field(() => [DailyWeatherForecastEntry])
	forecasts: DailyWeatherForecastEntry[];
}
