import { CurrentWeatherCondition } from '../../core/model/current-weather-condition.model';
import {
	DailyWeatherForecast,
	PartOfDayWeatherCondition,
} from '../../core/model/daily-weather-forecast.model';
import { HourlyWeatherForecast } from '../../core/model/hourly-weather-forecast.model';
import {
	CurrentConditionAPIResponse,
	DailyForecastAPIResponse,
	HourlyForecastAPIResponse,
	PartOfDayCondition,
} from './weather-api.model';
import { convertSpeedToBeaufort } from './weather.helpers';

export function mapCurrentConditionAPIResponse(
	response: CurrentConditionAPIResponse,
): CurrentWeatherCondition {
	const currentCondition = response.results[0];

	return {
		observationTime: new Date(currentCondition.dateTime),
		phrase: currentCondition.phrase,
		iconFileName: iconCodeToFileName(currentCondition.iconCode),
		hasPrecipitation: currentCondition.hasPrecipitation,
		temperatureCelsius: currentCondition.temperature.value,
		wind: {
			degrees: currentCondition.wind.direction.degrees,
			degreesDescription: currentCondition.wind.direction.localizedDescription,
			speed: {
				value: currentCondition.wind.speed.value,
				unit: currentCondition.wind.speed.unit,
				beaufort: convertSpeedToBeaufort(currentCondition.wind.speed.value),
			},
			gustSpeed: {
				value: currentCondition.windGust.speed.value,
				unit: currentCondition.windGust.speed.unit,
				beaufort: convertSpeedToBeaufort(currentCondition.windGust.speed.value),
			},
		},
		visibility: {
			value: currentCondition.visibility.value,
			unit: currentCondition.visibility.unit,
			obstruction: currentCondition.obstructionsToVisibility,
		},
		uvIndexPhrase: currentCondition.uvIndexPhrase,
		cloudCover: currentCondition.cloudCover,
		pressure: {
			value: currentCondition.pressure.value,
			unit: currentCondition.pressure.unit,
			tendency: {
				phrase: currentCondition.pressureTendency.localizedDescription,
				iconFileName: `pressure-tendency-${currentCondition.pressureTendency.code.toLowerCase()}.png`,
			},
		},
	};
}

export function mapHourlyForecastAPIResponse({
	forecasts,
}: HourlyForecastAPIResponse): HourlyWeatherForecast {
	return {
		forecasts: forecasts.map((forecast) => ({
			date: new Date(forecast.date),
			iconFileName: iconCodeToFileName(forecast.iconCode),
			temperatureCelsius: forecast.temperature.value,
			wind: {
				degrees: forecast.wind.direction.degrees,
				degreesDescription: forecast.wind.direction.localizedDescription,
				speed: {
					value: forecast.wind.speed.value,
					unit: forecast.wind.speed.unit,
					beaufort: convertSpeedToBeaufort(forecast.wind.speed.value),
				},
				gustSpeed: {
					value: forecast.windGust.speed.value,
					unit: forecast.windGust.speed.unit,
					beaufort: convertSpeedToBeaufort(forecast.windGust.speed.value),
				},
			},
			visibility: {
				value: forecast.visibility.value,
				unit: forecast.visibility.unit,
			},
			uvIndexPhrase: forecast.uvIndexPhrase,
			rain: {
				probability: forecast.rainProbability,
				amount: {
					value: forecast.rain.value,
					unit: forecast.rain.unit,
				},
			},
			snow: {
				probability: forecast.snowProbability,
				amount: {
					value: forecast.snow.value,
					unit: forecast.snow.unit,
				},
			},
			ice: {
				probability: forecast.iceProbability,
				amount: {
					value: forecast.ice.value,
					unit: forecast.ice.unit,
				},
			},
		})),
	};
}

export function mapDailyForecastAPIResponse(
	response: DailyForecastAPIResponse,
): DailyWeatherForecast {
	return {
		summaryPhrase: response.summary.phrase,
		forecasts: response.forecasts.map((forecast) => ({
			date: new Date(forecast.date),
			minTemperatureCelsius: forecast.temperature.minimum.value,
			maxTemperatureCelsius: forecast.temperature.maximum.value,
			day: mapPartOfDayCondition(forecast.day),
			night: mapPartOfDayCondition(forecast.night),
		})),
	};
}

function mapPartOfDayCondition(
	condition: PartOfDayCondition,
): PartOfDayWeatherCondition {
	return {
		iconFileName: iconCodeToFileName(condition.iconCode),
		longPhrase: condition.longPhrase,
		shortPhrase: condition.shortPhrase,
		rain: {
			probability: condition.rainProbability,
			amount: {
				value: condition.rain.value,
				unit: condition.rain.unit,
			},
			hours: condition.hoursOfRain,
		},
		snow: {
			probability: condition.snowProbability,
			amount: {
				value: condition.snow.value,
				unit: condition.snow.unit,
			},
			hours: condition.hoursOfSnow,
		},
		ice: {
			probability: condition.iceProbability,
			amount: {
				value: condition.ice.value,
				unit: condition.ice.unit,
			},
			hours: condition.hoursOfIce,
		},
		thunderstormProbability: condition.thunderstormProbability,
		wind: {
			degrees: condition.wind.direction.degrees,
			degreesDescription: condition.wind.direction.localizedDescription,
			speed: {
				value: condition.wind.speed.value,
				unit: condition.wind.speed.unit,
				beaufort: convertSpeedToBeaufort(condition.wind.speed.value),
			},
		},
		windGust: {
			degrees: condition.windGust.direction.degrees,
			degreesDescription: condition.windGust.direction.localizedDescription,
			speed: {
				value: condition.windGust.speed.value,
				unit: condition.windGust.speed.unit,
				beaufort: convertSpeedToBeaufort(condition.windGust.speed.value),
			},
		},
		cloudCover: condition.cloudCover,
	};
}

function iconCodeToFileName(iconCode: number): string {
	return `weather-${iconCode}.png`;
}
