import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CurrentWeatherCondition } from '../model/current-weather-condition.model';
import { WEATHER_SERVICE, WeatherService } from '../service/weather.service';

export class WeatherConditionQuery {
	constructor(
		readonly lat: number,
		readonly lon: number,
	) {}
}

@QueryHandler(WeatherConditionQuery)
export class WeatherConditionHandler
	implements IQueryHandler<WeatherConditionQuery>
{
	constructor(
		@Inject(WEATHER_SERVICE)
		private readonly weatherService: WeatherService,
	) {}

	async execute({
		lat,
		lon,
	}: WeatherConditionQuery): Promise<CurrentWeatherCondition> {
		return this.weatherService.getCondition(lat, lon);
	}
}
