import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { KordisLogger } from '@kordis/api/observability';

import { CurrentWeatherCondition } from '../../core/model/current-weather-condition.model';
import { DailyWeatherForecast } from '../../core/model/daily-weather-forecast.model';
import { HourlyWeatherForecast } from '../../core/model/hourly-weather-forecast.model';
import { WeatherService } from '../../core/service/weather.service';
import {
	MODULE_OPTIONS_TOKEN,
	WeatherOptions,
} from '../weather.module-options';
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

@Injectable()
export class AzureWeatherService implements WeatherService {
	private readonly azureMapKey?: string;
	private readonly azureMapBaseUrl = 'https://atlas.microsoft.com/weather';
	private readonly logger: KordisLogger = new Logger(AzureWeatherService.name);

	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) { azureMapKey }: WeatherOptions,
		private readonly httpService: HttpService,
	) {
		this.azureMapKey = azureMapKey;
		if (!this.azureMapKey) {
			this.logger.warn(
				"No Azure Map Key found in API Environment. Weather Service won't work.",
			);
		}
	}

	async getCondition(
		latitude: number,
		longitude: number,
	): Promise<CurrentWeatherCondition> {
		const { data } = await firstValueFrom(
			this.httpService.get<CurrentConditionAPIResponse>(
				`${this.azureMapBaseUrl}/currentConditions/json?api-version=1.1&language=de&query=${latitude},${longitude}&subscription-key=${this.azureMapKey}`,
			),
		);
		return mapCurrentConditionAPIResponse(data);
	}

	async getForeCastByHours(
		hours: 1 | 12 | 24 | 72,
		latitude: number,
		longitude: number,
	): Promise<HourlyWeatherForecast> {
		const { data } = await firstValueFrom(
			this.httpService.get<HourlyForecastAPIResponse>(
				`${this.azureMapBaseUrl}/forecast/hourly/json?api-version=1.1&language=de&query=${latitude},${longitude}&duration=${hours}&subscription-key=${this.azureMapKey}`,
			),
		);

		return mapHourlyForecastAPIResponse(data);
	}

	async getForeCastByDays(
		days: 1 | 5 | 10 | 15,
		latitude: number,
		longitude: number,
	): Promise<DailyWeatherForecast> {
		const { data } = await firstValueFrom(
			this.httpService.get<DailyForecastAPIResponse>(
				`${this.azureMapBaseUrl}/forecast/daily/json?api-version=1.1&language=de&query=${latitude},${longitude}&duration=${days}&subscription-key=${this.azureMapKey}`,
			),
		);

		return mapDailyForecastAPIResponse(data);
	}
}
