import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { DailyWeatherForecastHandler } from '../core/query/daily-weather-forecast.query';
import { HourlyWeatherForecastHandler } from '../core/query/hourly-weather-forecast.query';
import { WeatherConditionHandler } from '../core/query/weather-condition.query';
import { WEATHER_SERVICE } from '../core/service/weather.service';
import { WeatherResolver } from './controller/weather.resolver';
import { AzureWeatherService } from './service/azure-weather.service';
import { ConfigurableModuleClass } from './weather.module-options';

@Module({
	imports: [HttpModule],
	providers: [
		{
			provide: WEATHER_SERVICE,
			useClass: AzureWeatherService,
		},
		DailyWeatherForecastHandler,
		HourlyWeatherForecastHandler,
		WeatherConditionHandler,
		WeatherResolver,
	],
})
export class WeatherModule extends ConfigurableModuleClass {}
