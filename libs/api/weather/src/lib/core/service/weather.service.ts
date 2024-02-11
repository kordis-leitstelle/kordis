import { CurrentWeatherCondition } from '../model/current-weather-condition.model';
import { DailyWeatherForecast } from '../model/daily-weather-forecast.model';
import { HourlyWeatherForecast } from '../model/hourly-weather-forecast.model';

export const WEATHER_SERVICE = Symbol('WEATHER_SERVICE');

export interface WeatherService {
	getForeCastByHours(
		hours: 1 | 12 | 24 | 72,
		latitude: number,
		longitude: number,
	): Promise<HourlyWeatherForecast>;

	getForeCastByDays(
		days: 1 | 5 | 10,
		latitude: number,
		longitude: number,
	): Promise<DailyWeatherForecast>;

	getCondition(
		latitude: number,
		longitude: number,
	): Promise<CurrentWeatherCondition>;
}
