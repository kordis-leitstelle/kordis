import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { CURRENT_CONDITION_MODEL_EXAMPLE } from '../../infra/service/weather-example-data.test-helper';
import { WEATHER_SERVICE, WeatherService } from '../service/weather.service';
import {
	WeatherConditionHandler,
	WeatherConditionQuery,
} from './weather-condition.query';

describe('WeatherConditionHandler', () => {
	let weatherConditionHandler: WeatherConditionHandler;
	let mockWeatherService: DeepMocked<WeatherService>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				WeatherConditionHandler,
				{
					provide: WEATHER_SERVICE,
					useValue: createMock<WeatherService>(),
				},
			],
		}).compile();

		mockWeatherService =
			moduleRef.get<DeepMocked<WeatherService>>(WEATHER_SERVICE);
		weatherConditionHandler = moduleRef.get<WeatherConditionHandler>(
			WeatherConditionHandler,
		);
	});

	it('should return current weather condition', async () => {
		mockWeatherService.getCondition.mockResolvedValueOnce(
			CURRENT_CONDITION_MODEL_EXAMPLE,
		);

		await expect(
			weatherConditionHandler.execute(new WeatherConditionQuery(55.5, 9.9)),
		).resolves.toEqual(CURRENT_CONDITION_MODEL_EXAMPLE);
	});
});
