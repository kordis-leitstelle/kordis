import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { DAILY_FORECAST_MODEL_EXAMPLE } from '../../infra/service/weather-example-data.test-helper';
import { WEATHER_SERVICE, WeatherService } from '../service/weather.service';
import {
	DailyWeatherForecastHandler,
	DailyWeatherForecastQuery,
} from './daily-weather-forecast.query';

describe('DailyWeatherForecastHandler', () => {
	let dailyWeatherForecastHandler: DailyWeatherForecastHandler;
	let mockWeatherService: DeepMocked<WeatherService>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				DailyWeatherForecastHandler,
				{
					provide: WEATHER_SERVICE,
					useValue: createMock<WeatherService>(),
				},
			],
		}).compile();

		mockWeatherService =
			moduleRef.get<DeepMocked<WeatherService>>(WEATHER_SERVICE);
		dailyWeatherForecastHandler = moduleRef.get<DailyWeatherForecastHandler>(
			DailyWeatherForecastHandler,
		);
	});

	it('should return current weather condition', async () => {
		mockWeatherService.getForeCastByDays.mockResolvedValueOnce(
			DAILY_FORECAST_MODEL_EXAMPLE,
		);

		await expect(
			dailyWeatherForecastHandler.execute(
				new DailyWeatherForecastQuery(55.5, 9.9, 1),
			),
		).resolves.toEqual(DAILY_FORECAST_MODEL_EXAMPLE);
	});
});
