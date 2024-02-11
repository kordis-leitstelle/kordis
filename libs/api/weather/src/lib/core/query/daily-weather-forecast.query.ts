import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DailyWeatherForecast } from '../model/daily-weather-forecast.model';
import { WEATHER_SERVICE, WeatherService } from '../service/weather.service';

export class DailyWeatherForecastQuery {
	constructor(
		readonly lat: number,
		readonly lon: number,
		readonly days: 1 | 5 | 10,
	) {}
}

@QueryHandler(DailyWeatherForecastQuery)
export class DailyWeatherForecastHandler
	implements IQueryHandler<DailyWeatherForecastQuery>
{
	constructor(
		@Inject(WEATHER_SERVICE)
		private readonly weatherService: WeatherService,
	) {}

	async execute({
		lat,
		lon,
		days,
	}: DailyWeatherForecastQuery): Promise<DailyWeatherForecast> {
		return this.weatherService.getForeCastByDays(days, lat, lon);
	}
}
