import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { HourlyWeatherForecast } from '../model/hourly-weather-forecast.model';
import { WEATHER_SERVICE, WeatherService } from '../service/weather.service';

export class HourlyWeatherForecastQuery {
	constructor(
		readonly lat: number,
		readonly lon: number,
		readonly hours: 1 | 12 | 24 | 72,
	) {}
}

@QueryHandler(HourlyWeatherForecastQuery)
export class HourlyWeatherForecastHandler
	implements IQueryHandler<HourlyWeatherForecastQuery>
{
	constructor(
		@Inject(WEATHER_SERVICE)
		private readonly weatherService: WeatherService,
	) {}

	async execute({
		lat,
		lon,
		hours,
	}: HourlyWeatherForecastQuery): Promise<HourlyWeatherForecast> {
		return this.weatherService.getForeCastByHours(hours, lat, lon);
	}
}
