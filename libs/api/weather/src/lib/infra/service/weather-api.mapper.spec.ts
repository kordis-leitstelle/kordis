import { CurrentWeatherCondition } from '../../core/model/current-weather-condition.model';
import { DailyWeatherForecast } from '../../core/model/daily-weather-forecast.model';
import { HourlyWeatherForecast } from '../../core/model/hourly-weather-forecast.model';
import {
	CURRENT_CONDITION_API_RESPONSE_EXAMPLE,
	CURRENT_CONDITION_MODEL_EXAMPLE,
	DAILY_FORECAST_API_RESPONSE_EXAMPLE,
	DAILY_FORECAST_MODEL_EXAMPLE,
	HOURLY_FORECAST_API_RESPONSE_EXAMPLE,
	HOURLY_FORECAST_MODEL_EXAMPLE,
} from './weather-example-data.test-helper';
import {
	mapCurrentConditionAPIResponse,
	mapDailyForecastAPIResponse,
	mapHourlyForecastAPIResponse,
} from './weather-api.mapper';
import {
	CurrentConditionAPIResponse,
	DailyForecastAPIResponse,
	HourlyForecastAPIResponse,
} from './weather-api.model';

describe('weather-api.mapper', () => {
	it('should map current condition API response correctly', () => {
		const response: CurrentConditionAPIResponse =
			CURRENT_CONDITION_API_RESPONSE_EXAMPLE;
		const expected: CurrentWeatherCondition = CURRENT_CONDITION_MODEL_EXAMPLE;

		const result = mapCurrentConditionAPIResponse(response);
		expect(result).toEqual(expected);
	});

	it('should map hourly forecast API response correctly', () => {
		const response: HourlyForecastAPIResponse =
			HOURLY_FORECAST_API_RESPONSE_EXAMPLE;
		const expected: HourlyWeatherForecast = HOURLY_FORECAST_MODEL_EXAMPLE;

		const result = mapHourlyForecastAPIResponse(response);
		expect(result).toEqual(expected);
	});

	it('should map daily forecast API response correctly', () => {
		const response: DailyForecastAPIResponse =
			DAILY_FORECAST_API_RESPONSE_EXAMPLE;

		const expected: DailyWeatherForecast = DAILY_FORECAST_MODEL_EXAMPLE;

		const result = mapDailyForecastAPIResponse(response);
		expect(result).toEqual(expected);
	});
});
