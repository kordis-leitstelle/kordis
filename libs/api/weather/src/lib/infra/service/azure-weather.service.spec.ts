import { createMock } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

import {
	CURRENT_CONDITION_API_RESPONSE_EXAMPLE,
	CURRENT_CONDITION_MODEL_EXAMPLE,
	DAILY_FORECAST_API_RESPONSE_EXAMPLE,
	DAILY_FORECAST_MODEL_EXAMPLE,
	HOURLY_FORECAST_API_RESPONSE_EXAMPLE,
	HOURLY_FORECAST_MODEL_EXAMPLE,
} from '../../weather-example-data.test-helper';
import { MODULE_OPTIONS_TOKEN } from '../weather.module-options';
import { AzureWeatherService } from './azure-weather.service';

describe('AzureWeatherService', () => {
	let weatherService: AzureWeatherService;
	let httpService: HttpService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: MODULE_OPTIONS_TOKEN,
					useValue: {
						azureMapKey: 'azure-map-key',
					},
				},
				AzureWeatherService,
				{
					provide: HttpService,
					useValue: createMock<HttpService>(),
				},
				{
					provide: ConfigService,
					useValue: createMock<ConfigService>({
						getOrThrow: jest.fn().mockReturnValue(''),
					}),
				},
			],
		}).compile();

		weatherService = module.get<AzureWeatherService>(AzureWeatherService);
		httpService = module.get<HttpService>(HttpService);
	});

	it('should return the current weather condition', async () => {
		const latitude = 123;
		const longitude = 456;
		jest.spyOn(httpService, 'get').mockReturnValue(
			of({
				data: CURRENT_CONDITION_API_RESPONSE_EXAMPLE,
			} as AxiosResponse),
		);

		const result = await weatherService.getCondition(latitude, longitude);

		expect(result).toEqual(CURRENT_CONDITION_MODEL_EXAMPLE);
		expect(httpService.get).toHaveBeenCalledWith(
			expect.stringContaining(`query=${latitude},${longitude}`),
		);
	});

	it('should return the hourly weather forecast', async () => {
		const hours = 24;
		const latitude = 123;
		const longitude = 456;

		jest.spyOn(httpService, 'get').mockReturnValue(
			of({
				data: HOURLY_FORECAST_API_RESPONSE_EXAMPLE,
			} as AxiosResponse),
		);

		const result = await weatherService.getForeCastByHours(
			hours,
			latitude,
			longitude,
		);

		expect(result).toEqual(HOURLY_FORECAST_MODEL_EXAMPLE);
		expect(httpService.get).toHaveBeenCalledWith(
			expect.stringContaining(
				`query=${latitude},${longitude}&duration=${hours}`,
			),
		);
	});

	it('should return the daily weather forecast', async () => {
		const days = 5;
		const latitude = 123;
		const longitude = 456;

		jest.spyOn(httpService, 'get').mockReturnValue(
			of({
				data: DAILY_FORECAST_API_RESPONSE_EXAMPLE,
			} as AxiosResponse),
		);

		const result = await weatherService.getForeCastByDays(
			days,
			latitude,
			longitude,
		);

		expect(result).toEqual(DAILY_FORECAST_MODEL_EXAMPLE);
		expect(httpService.get).toHaveBeenCalledWith(
			expect.stringContaining(
				`query=${latitude},${longitude}&duration=${days}`,
			),
		);
	});
});
