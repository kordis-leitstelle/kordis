import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Cache } from 'cache-manager';

import { CurrentWeatherCondition } from '../../core/model/current-weather-condition.model';
import { DailyWeatherForecast } from '../../core/model/daily-weather-forecast.model';
import { HourlyWeatherForecast } from '../../core/model/hourly-weather-forecast.model';
import { DailyWeatherForecastQuery } from '../../core/query/daily-weather-forecast.query';
import { HourlyWeatherForecastQuery } from '../../core/query/hourly-weather-forecast.query';
import { WeatherConditionQuery } from '../../core/query/weather-condition.query';
import { DailyWeatherForecastArgs } from './args/daily-weather-forecast.args';
import { HourlyWeatherForecastArgs } from './args/hourly-weather-forecast.args';
import { WeatherConditionsArgs } from './args/weather-conditions.args';

@Resolver()
export class WeatherResolver {
	constructor(
		private readonly queryBus: QueryBus,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	@Query(() => CurrentWeatherCondition)
	async currentWeatherCondition(
		@Args() { latitude, longitude }: WeatherConditionsArgs,
	): Promise<CurrentWeatherCondition> {
		return this.cacheManager.wrap(
			`currentWeatherCondition-${this.coordsToCacheableKey(
				latitude,
				longitude,
				3,
			)}`,
			() =>
				this.queryBus.execute(new WeatherConditionQuery(latitude, longitude)),
			1000 * 60, // 1 min
		);
	}

	@Query(() => HourlyWeatherForecast)
	async hourlyWeatherForecast(
		@Args() { latitude, longitude, hours }: HourlyWeatherForecastArgs,
	): Promise<HourlyWeatherForecast> {
		return this.cacheManager.wrap(
			`hourlyWeatherForecast-${this.coordsToCacheableKey(
				latitude,
				longitude,
			)}-${hours}-hours`,
			() =>
				this.queryBus.execute(
					new HourlyWeatherForecastQuery(latitude, longitude, hours),
				),
			1000 * 60 * 10, // 10 min
		);
	}

	@Query(() => DailyWeatherForecast)
	async dailyWeatherForecast(
		@Args() { latitude, longitude, days }: DailyWeatherForecastArgs,
	): Promise<DailyWeatherForecast> {
		return this.cacheManager.wrap(
			`dailyWeatherForecast-${this.coordsToCacheableKey(
				latitude,
				longitude,
			)}-${days}-days`,
			() =>
				this.queryBus.execute(
					new DailyWeatherForecastQuery(latitude, longitude, days),
				),
			1000 * 60 * 60, // 1h
		);
	}

	private coordsToCacheableKey(
		lat: number,
		lon: number,
		precision = 2,
	): string {
		// this creates an acceptable area for the coordinate, an alternative would be to use a geohashing algo
		return `${lat.toFixed(precision)}-${lon.toFixed(precision)}`;
	}
}
