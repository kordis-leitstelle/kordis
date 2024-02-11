import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CacheModule } from '@nestjs/cache-manager';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { DailyWeatherForecastQuery } from '../../core/query/daily-weather-forecast.query';
import { HourlyWeatherForecastQuery } from '../../core/query/hourly-weather-forecast.query';
import { WeatherConditionQuery } from '../../core/query/weather-condition.query';
import {
	CURRENT_CONDITION_MODEL_EXAMPLE,
	DAILY_FORECAST_MODEL_EXAMPLE,
	HOURLY_FORECAST_MODEL_EXAMPLE,
} from '../service/weather-example-data.test-helper';
import { WeatherResolver } from './weather.resolver';

describe('WeatherResolver', () => {
	let weatherResolver: WeatherResolver;
	let queryBus: DeepMocked<QueryBus>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [CacheModule.register()],
			providers: [
				WeatherResolver,
				{
					provide: QueryBus,
					useValue: createMock<QueryBus>(),
				},
			],
		}).compile();

		weatherResolver = module.get<WeatherResolver>(WeatherResolver);
		queryBus = module.get<DeepMocked<QueryBus>>(QueryBus);
	});

	describe('current weather condition', () => {
		it('should return current weather condition', async () => {
			const latitude = 5.55;
			const longitude = 9.9;

			queryBus.execute.mockResolvedValueOnce(CURRENT_CONDITION_MODEL_EXAMPLE);

			const result = await weatherResolver.currentWeatherCondition({
				latitude,
				longitude,
			});

			expect(result).toEqual(CURRENT_CONDITION_MODEL_EXAMPLE);
			expect(queryBus.execute).toHaveBeenCalledWith(
				new WeatherConditionQuery(latitude, longitude),
			);
		});

		it('should return current weather condition from cache', async () => {
			queryBus.execute.mockResolvedValueOnce(CURRENT_CONDITION_MODEL_EXAMPLE);

			await weatherResolver.currentWeatherCondition({
				latitude: 53.551086,
				longitude: 9.993682,
			});
			const result = await weatherResolver.currentWeatherCondition({
				latitude: 53.551436,
				longitude: 9.994445,
			});

			expect(result).toEqual(CURRENT_CONDITION_MODEL_EXAMPLE);
			expect(queryBus.execute).toHaveBeenCalledTimes(1);
		});
	});

	describe('hourly weather forecast', () => {
		it('should return hourly weather forecast', async () => {
			const latitude = 5.55;
			const longitude = 9.9;
			const hours = 1;
			queryBus.execute.mockResolvedValueOnce(HOURLY_FORECAST_MODEL_EXAMPLE);

			const result = await weatherResolver.hourlyWeatherForecast({
				latitude,
				longitude,
				hours,
			});

			expect(result).toEqual(HOURLY_FORECAST_MODEL_EXAMPLE);
			expect(queryBus.execute).toHaveBeenCalledWith(
				new HourlyWeatherForecastQuery(latitude, longitude, hours),
			);
		});

		it('should return hourly weather forecast from cache', async () => {
			queryBus.execute.mockResolvedValueOnce(HOURLY_FORECAST_MODEL_EXAMPLE);

			await weatherResolver.hourlyWeatherForecast({
				latitude: 53.551086,
				longitude: 9.993682,
				hours: 1,
			});

			const result = await weatherResolver.hourlyWeatherForecast({
				latitude: 53.551436,
				longitude: 9.994445,
				hours: 1,
			});

			expect(result).toEqual(HOURLY_FORECAST_MODEL_EXAMPLE);
			expect(queryBus.execute).toHaveBeenCalledTimes(1);
		});
	});

	describe('daily weather forecast', () => {
		it('should return daily weather forecast', async () => {
			const latitude = 5.55;
			const longitude = 9.9;
			const days = 1;
			queryBus.execute.mockResolvedValueOnce(DAILY_FORECAST_MODEL_EXAMPLE);

			const result = await weatherResolver.dailyWeatherForecast({
				latitude,
				longitude,
				days,
			});

			expect(result).toEqual(DAILY_FORECAST_MODEL_EXAMPLE);
			expect(queryBus.execute).toHaveBeenCalledWith(
				new DailyWeatherForecastQuery(latitude, longitude, days),
			);
		});

		it('should return daily weather forecast from cache', async () => {
			queryBus.execute.mockResolvedValueOnce(DAILY_FORECAST_MODEL_EXAMPLE);

			await weatherResolver.dailyWeatherForecast({
				latitude: 53.551086,
				longitude: 9.993682,
				days: 1,
			});

			const result = await weatherResolver.dailyWeatherForecast({
				latitude: 53.551436,
				longitude: 9.994445,
				days: 1,
			});

			expect(result).toEqual(DAILY_FORECAST_MODEL_EXAMPLE);
			expect(queryBus.execute).toHaveBeenCalledTimes(1);
		});
	});
});
