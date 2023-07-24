import { CurrentWeatherCondition } from './core/model/current-weather-condition.model';
import { DailyWeatherForecast } from './core/model/daily-weather-forecast.model';
import { HourlyWeatherForecast } from './core/model/hourly-weather-forecast.model';
import {
	CurrentConditionAPIResponse,
	DailyForecastAPIResponse,
	HourlyForecastAPIResponse,
} from './infra/service/weather-api.model';

export const CURRENT_CONDITION_API_RESPONSE_EXAMPLE: CurrentConditionAPIResponse =
	Object.freeze({
		results: [
			{
				dateTime: '2023-06-20T10:32:00+02:00',
				phrase: 'Stark bewölkt',
				iconCode: 6,
				hasPrecipitation: false,
				isDayTime: true,
				temperature: {
					value: 23.3,
					unit: 'C',
					unitType: 17,
				},
				realFeelTemperature: {
					value: 25.7,
					unit: 'C',
					unitType: 17,
				},
				realFeelTemperatureShade: {
					value: 21.9,
					unit: 'C',
					unitType: 17,
				},
				relativeHumidity: 58,
				dewPoint: {
					value: 14.6,
					unit: 'C',
					unitType: 17,
				},
				wind: {
					direction: {
						degrees: 68.0,
						localizedDescription: 'ONO',
					},
					speed: {
						value: 10.9,
						unit: 'km/h',
						unitType: 7,
					},
				},
				windGust: {
					speed: {
						value: 22.2,
						unit: 'km/h',
						unitType: 7,
					},
				},
				uvIndex: 5,
				uvIndexPhrase: 'Mittel',
				visibility: {
					value: 16.1,
					unit: 'km',
					unitType: 6,
				},
				obstructionsToVisibility: '',
				cloudCover: 76,
				ceiling: {
					value: 4846.0,
					unit: 'm',
					unitType: 5,
				},
				pressure: {
					value: 1014.0,
					unit: 'mb',
					unitType: 14,
				},
				pressureTendency: {
					localizedDescription: 'Gleichbleibend',
					code: 'S',
				},
				past24HourTemperatureDeparture: {
					value: 0.5,
					unit: 'C',
					unitType: 17,
				},
				apparentTemperature: {
					value: 23.3,
					unit: 'C',
					unitType: 17,
				},
				windChillTemperature: {
					value: 23.3,
					unit: 'C',
					unitType: 17,
				},
				wetBulbTemperature: {
					value: 17.7,
					unit: 'C',
					unitType: 17,
				},
				precipitationSummary: {
					pastHour: {
						value: 0.0,
						unit: 'mm',
						unitType: 3,
					},
					past3Hours: {
						value: 0.0,
						unit: 'mm',
						unitType: 3,
					},
					past6Hours: {
						value: 0.0,
						unit: 'mm',
						unitType: 3,
					},
					past9Hours: {
						value: 0.0,
						unit: 'mm',
						unitType: 3,
					},
					past12Hours: {
						value: 1.0,
						unit: 'mm',
						unitType: 3,
					},
					past18Hours: {
						value: 2.6,
						unit: 'mm',
						unitType: 3,
					},
					past24Hours: {
						value: 5.4,
						unit: 'mm',
						unitType: 3,
					},
				},
				temperatureSummary: {
					past6Hours: {
						minimum: {
							value: 15.0,
							unit: 'C',
							unitType: 17,
						},
						maximum: {
							value: 23.3,
							unit: 'C',
							unitType: 17,
						},
					},
					past12Hours: {
						minimum: {
							value: 15.0,
							unit: 'C',
							unitType: 17,
						},
						maximum: {
							value: 23.3,
							unit: 'C',
							unitType: 17,
						},
					},
					past24Hours: {
						minimum: {
							value: 15.0,
							unit: 'C',
							unitType: 17,
						},
						maximum: {
							value: 28.4,
							unit: 'C',
							unitType: 17,
						},
					},
				},
			},
		],
	});
export const CURRENT_CONDITION_MODEL_EXAMPLE: CurrentWeatherCondition =
	Object.freeze({
		observationTime: new Date('2023-06-20T10:32:00+02:00'),
		phrase: 'Stark bewölkt',
		iconFileName: 'weather-6.png',
		hasPrecipitation: false,
		temperatureCelsius: 23.3,
		wind: {
			degrees: 68,
			degreesDescription: 'ONO',
			speed: {
				value: 10.9,
				unit: 'km/h',
				beaufort: {
					grade: 2,
					description: 'Leichte Brise',
				},
			},
			gustSpeed: {
				value: 22.2,
				unit: 'km/h',
				beaufort: {
					grade: 4,
					description: 'Mäßige Brise',
				},
			},
		},
		visibility: {
			value: 16.1,
			unit: 'km',
			obstruction: '',
		},
		uvIndexPhrase: 'Mittel',
		cloudCover: 76,
		pressure: {
			value: 1014,
			unit: 'mb',
			tendency: {
				phrase: 'Gleichbleibend',
				iconFileName: 'pressure-tendency-s.png',
			},
		},
	});

export const HOURLY_FORECAST_API_RESPONSE_EXAMPLE: HourlyForecastAPIResponse =
	Object.freeze({
		forecasts: [
			{
				date: '2023-06-20T11:00:00+02:00',
				iconCode: 16,
				iconPhrase: 'Stark bewölkt mit Gewittern',
				hasPrecipitation: true,
				precipitationType: 'Rain',
				precipitationIntensity: 'Moderate',
				isDaylight: true,
				temperature: {
					value: 24.3,
					unit: 'C',
					unitType: 17,
				},
				realFeelTemperature: {
					value: 23.8,
					unit: 'C',
					unitType: 17,
				},
				wetBulbTemperature: {
					value: 18.9,
					unit: 'C',
					unitType: 17,
				},
				dewPoint: {
					value: 15.5,
					unit: 'C',
					unitType: 17,
				},
				wind: {
					direction: {
						degrees: 77.0,
						localizedDescription: 'ONO',
					},
					speed: {
						value: 11.1,
						unit: 'km/h',
						unitType: 7,
					},
				},
				windGust: {
					speed: {
						value: 22.2,
						unit: 'km/h',
						unitType: 7,
					},
				},
				relativeHumidity: 58,
				visibility: {
					value: 8.0,
					unit: 'km',
					unitType: 6,
				},
				cloudCover: 70,
				ceiling: {
					value: 5761.0,
					unit: 'm',
					unitType: 5,
				},
				uvIndex: 3,
				uvIndexPhrase: 'Mittel',
				precipitationProbability: 61,
				rainProbability: 61,
				snowProbability: 0,
				iceProbability: 0,
				totalLiquid: {
					value: 1.3,
					unit: 'mm',
					unitType: 3,
				},
				rain: {
					value: 1.3,
					unit: 'mm',
					unitType: 3,
				},
				snow: {
					value: 0.0,
					unit: 'cm',
					unitType: 4,
				},
				ice: {
					value: 0.0,
					unit: 'mm',
					unitType: 3,
				},
			},
		],
	});
export const HOURLY_FORECAST_MODEL_EXAMPLE: HourlyWeatherForecast = {
	forecasts: [
		{
			date: new Date('2023-06-20T11:00:00+02:00'),
			iconFileName: 'weather-16.png',
			temperatureCelsius: 24.3,
			wind: {
				degrees: 77,
				degreesDescription: 'ONO',
				speed: {
					value: 11.1,
					unit: 'km/h',
					beaufort: {
						grade: 2,
						description: 'Leichte Brise',
					},
				},
				gustSpeed: {
					value: 22.2,
					unit: 'km/h',
					beaufort: {
						grade: 4,
						description: 'Mäßige Brise',
					},
				},
			},
			visibility: {
				value: 8,
				unit: 'km',
			},
			uvIndexPhrase: 'Mittel',
			rain: {
				probability: 61,
				amount: {
					value: 1.3,
					unit: 'mm',
				},
			},
			snow: {
				probability: 0,
				amount: {
					value: 0,
					unit: 'cm',
				},
			},
			ice: {
				probability: 0,
				amount: {
					value: 0,
					unit: 'mm',
				},
			},
		},
	],
};

export const DAILY_FORECAST_API_RESPONSE_EXAMPLE: DailyForecastAPIResponse = {
	summary: {
		startDate: '2023-06-20T08:00:00+02:00',
		endDate: '2023-06-21T14:00:00+02:00',
		severity: 3,
		phrase:
			'Vereinzelte Schauer und Gewitter Dienstagmorgen bis Mittwochmorgen',
		category: 'thunderstorm',
	},
	forecasts: [
		{
			date: '2023-06-20T07:00:00+02:00',
			temperature: {
				minimum: {
					value: 19.3,
					unit: 'C',
					unitType: 17,
				},
				maximum: {
					value: 27.3,
					unit: 'C',
					unitType: 17,
				},
			},
			realFeelTemperature: {
				minimum: {
					value: 18.2,
					unit: 'C',
					unitType: 17,
				},
				maximum: {
					value: 28.5,
					unit: 'C',
					unitType: 17,
				},
			},
			realFeelTemperatureShade: {
				minimum: {
					value: 18.2,
					unit: 'C',
					unitType: 17,
				},
				maximum: {
					value: 26.1,
					unit: 'C',
					unitType: 17,
				},
			},
			hoursOfSun: 6.0,
			degreeDaySummary: {
				heating: {
					value: 0.0,
					unit: 'C',
					unitType: 17,
				},
				cooling: {
					value: 5.0,
					unit: 'C',
					unitType: 17,
				},
			},
			airAndPollen: [
				{
					name: 'AirQuality',
					value: 0,
					category: 'Gut',
					categoryValue: 1,
					type: 'Ozon',
				},
				{
					name: 'Grass',
					value: 31,
					category: 'Ungesund (empfindlich)',
					categoryValue: 3,
				},
				{
					name: 'Mold',
					value: 0,
					category: 'Gut',
					categoryValue: 1,
				},
				{
					name: 'Ragweed',
					value: 0,
					category: 'Gut',
					categoryValue: 1,
				},
				{
					name: 'Tree',
					value: 0,
					category: 'Gut',
					categoryValue: 1,
				},
				{
					name: 'UVIndex',
					value: 5,
					category: 'Mittel',
					categoryValue: 2,
				},
			],
			day: {
				iconCode: 17,
				iconPhrase: 'Teils sonnig mit Gewittern',
				hasPrecipitation: true,
				precipitationType: 'Rain',
				precipitationIntensity: 'Moderate',
				shortPhrase: 'Einzelne Gewitter und Schauer',
				longPhrase: 'Wolken und Sonne; heiß, einige Gewitter und Schauer',
				precipitationProbability: 88,
				thunderstormProbability: 35,
				rainProbability: 88,
				snowProbability: 0,
				iceProbability: 0,
				wind: {
					direction: {
						degrees: 101.0,
						localizedDescription: 'O',
					},
					speed: {
						value: 11.1,
						unit: 'km/h',
						unitType: 7,
					},
				},
				windGust: {
					direction: {
						degrees: 115.0,
						localizedDescription: 'OSO',
					},
					speed: {
						value: 27.8,
						unit: 'km/h',
						unitType: 7,
					},
				},
				totalLiquid: {
					value: 5.1,
					unit: 'mm',
					unitType: 3,
				},
				rain: {
					value: 5.1,
					unit: 'mm',
					unitType: 3,
				},
				snow: {
					value: 0.0,
					unit: 'cm',
					unitType: 4,
				},
				ice: {
					value: 0.0,
					unit: 'mm',
					unitType: 3,
				},
				hoursOfPrecipitation: 2.0,
				hoursOfRain: 2.0,
				hoursOfSnow: 0.0,
				hoursOfIce: 0.0,
				cloudCover: 72,
			},
			night: {
				iconCode: 12,
				iconPhrase: 'Schauer',
				hasPrecipitation: true,
				precipitationType: 'Rain',
				precipitationIntensity: 'Light',
				shortPhrase: 'Einige Schauer',
				longPhrase: 'Überwiegend bewölkt, warm und vereinzelte Schauer',
				precipitationProbability: 84,
				thunderstormProbability: 18,
				rainProbability: 84,
				snowProbability: 0,
				iceProbability: 0,
				wind: {
					direction: {
						degrees: 173.0,
						localizedDescription: 'S',
					},
					speed: {
						value: 9.3,
						unit: 'km/h',
						unitType: 7,
					},
				},
				windGust: {
					direction: {
						degrees: 95.0,
						localizedDescription: 'O',
					},
					speed: {
						value: 24.1,
						unit: 'km/h',
						unitType: 7,
					},
				},
				totalLiquid: {
					value: 2.4,
					unit: 'mm',
					unitType: 3,
				},
				rain: {
					value: 2.4,
					unit: 'mm',
					unitType: 3,
				},
				snow: {
					value: 0.0,
					unit: 'cm',
					unitType: 4,
				},
				ice: {
					value: 0.0,
					unit: 'mm',
					unitType: 3,
				},
				hoursOfPrecipitation: 1.5,
				hoursOfRain: 1.5,
				hoursOfSnow: 0.0,
				hoursOfIce: 0.0,
				cloudCover: 79,
			},
		},
	],
};

export const DAILY_FORECAST_MODEL_EXAMPLE: DailyWeatherForecast = {
	summaryPhrase:
		'Vereinzelte Schauer und Gewitter Dienstagmorgen bis Mittwochmorgen',
	forecasts: [
		{
			date: new Date('2023-06-20T05:00:00.000Z'),
			minTemperatureCelsius: 19.3,
			maxTemperatureCelsius: 27.3,
			day: {
				iconFileName: 'weather-17.png',
				longPhrase: 'Wolken und Sonne; heiß, einige Gewitter und Schauer',
				shortPhrase: 'Einzelne Gewitter und Schauer',
				rain: {
					probability: 88,
					amount: {
						value: 5.1,
						unit: 'mm',
					},
					hours: 2,
				},
				snow: {
					probability: 0,
					amount: {
						value: 0,
						unit: 'cm',
					},
					hours: 0,
				},
				ice: {
					probability: 0,
					amount: {
						value: 0,
						unit: 'mm',
					},
					hours: 0,
				},
				thunderstormProbability: 35,
				wind: {
					degrees: 101,
					degreesDescription: 'O',
					speed: {
						value: 11.1,
						unit: 'km/h',
						beaufort: {
							grade: 2,
							description: 'Leichte Brise',
						},
					},
				},
				windGust: {
					degrees: 115,
					degreesDescription: 'OSO',
					speed: {
						value: 27.8,
						unit: 'km/h',
						beaufort: {
							grade: 4,
							description: 'Mäßige Brise',
						},
					},
				},
				cloudCover: 72,
			},
			night: {
				iconFileName: 'weather-12.png',
				longPhrase: 'Überwiegend bewölkt, warm und vereinzelte Schauer',
				shortPhrase: 'Einige Schauer',
				rain: {
					probability: 84,
					amount: {
						value: 2.4,
						unit: 'mm',
					},
					hours: 1.5,
				},
				snow: {
					probability: 0,
					amount: {
						value: 0,
						unit: 'cm',
					},
					hours: 0,
				},
				ice: {
					probability: 0,
					amount: {
						value: 0,
						unit: 'mm',
					},
					hours: 0,
				},
				thunderstormProbability: 18,
				wind: {
					degrees: 173,
					degreesDescription: 'S',
					speed: {
						value: 9.3,
						unit: 'km/h',
						beaufort: {
							grade: 2,
							description: 'Leichte Brise',
						},
					},
				},
				windGust: {
					degrees: 95,
					degreesDescription: 'O',
					speed: {
						value: 24.1,
						unit: 'km/h',
						beaufort: {
							grade: 4,
							description: 'Mäßige Brise',
						},
					},
				},
				cloudCover: 79,
			},
		},
	],
};
