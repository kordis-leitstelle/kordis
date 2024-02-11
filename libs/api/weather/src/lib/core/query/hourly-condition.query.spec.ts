import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { HOURLY_FORECAST_MODEL_EXAMPLE } from '../../infra/service/weather-example-data.test-helper';
import { WEATHER_SERVICE, WeatherService } from '../service/weather.service';
import {
	HourlyWeatherForecastHandler,
	HourlyWeatherForecastQuery,
} from './hourly-weather-forecast.query';

describe('HourlyWeatherForecastHandler', () => {
	let hourlyWeatherForecastHandler: HourlyWeatherForecastHandler;
	let mockWeatherService: DeepMocked<WeatherService>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				HourlyWeatherForecastHandler,
				{
					provide: WEATHER_SERVICE,
					useValue: createMock<WeatherService>(),
				},
			],
		}).compile();

		mockWeatherService =
			moduleRef.get<DeepMocked<WeatherService>>(WEATHER_SERVICE);
		hourlyWeatherForecastHandler = moduleRef.get<HourlyWeatherForecastHandler>(
			HourlyWeatherForecastHandler,
		);
	});

	it('should hourly weather forecast', async () => {
		mockWeatherService.getForeCastByHours.mockResolvedValueOnce(
			HOURLY_FORECAST_MODEL_EXAMPLE,
		);

		await expect(
			hourlyWeatherForecastHandler.execute(
				new HourlyWeatherForecastQuery(55.5, 9.9, 12),
			),
		).resolves.toEqual(HOURLY_FORECAST_MODEL_EXAMPLE);
	});
});
