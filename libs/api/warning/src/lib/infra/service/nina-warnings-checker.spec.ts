import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Model } from 'mongoose';
import { of } from 'rxjs';

import { Warning } from '../../core/model/warning.model';
import { NinaWarningsChecker } from '../service/nina-warnings-checker';

const EXAMPLE_WARNING_INFO = Object.freeze({
	identifier: '1',
	sent: '2022-01-01T00:00:00Z',
	sender: 'NINA',
	info: [
		{
			language: 'de',
			severity: 'Severe',
			effective: '2022-01-01T00:00:00Z',
			expires: '2022-01-02T00:00:00Z',
			headline: 'Warning Title',
			description: 'Warning Description',
			instruction: 'Warning Instruction',
		},
	],
});

const EXAMPLE_WARNING_GEOJSON = Object.freeze({
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[13.4156494140625, 52.562995039558004],
						[13.3597412109375, 52.53627304145948],
						[13.44757080078125, 52.51463422084366],
						[13.4156494140625, 52.562995039558004],
					],
				],
			},
		},
	],
});

describe('NinaWarningsChecker', () => {
	let ninaWarningsChecker: NinaWarningsChecker;
	let httpService: DeepMocked<HttpService>;
	let warningModel: DeepMocked<Model<Warning>>;

	beforeEach(async () => {
		httpService = createMock<HttpService>();
		warningModel = createMock<Model<Warning>>();

		ninaWarningsChecker = new NinaWarningsChecker(
			warningModel,
			['https://nina.api.proxy.bund.dev/api31/katwarn/mapData.json'],
			httpService,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should create a new warning', async () => {
		const mockData = { id: '1', version: 1 };
		const expectedWarning: Warning = {
			sourceId: '1',
			sourceVersion: 1,
			sentAt: new Date('2022-01-01T00:00:00.000Z'),
			sender: 'NINA',
			severity: 'Severe',
			effective: new Date('2022-01-01T00:00:00.000Z'),
			expires: new Date('2022-01-02T00:00:00.000Z'),
			title: 'Warning Title',
			description: 'Warning Description',
			instruction: 'Warning Instruction',
			affectedLocations: {
				type: 'GeometryCollection',
				geometries: [
					{
						type: 'Polygon',
						coordinates: [
							[
								[13.4156494140625, 52.562995039558004],
								[13.3597412109375, 52.53627304145948],
								[13.44757080078125, 52.51463422084366],
								[13.4156494140625, 52.562995039558004],
							],
						],
					},
				],
			},
		};

		httpService.get
			.mockReturnValueOnce(of({ data: [mockData] } as AxiosResponse))
			.mockReturnValueOnce(
				of({
					data: EXAMPLE_WARNING_INFO,
				} as AxiosResponse),
			)
			.mockReturnValueOnce(
				of({
					data: EXAMPLE_WARNING_GEOJSON,
				} as AxiosResponse),
			);

		warningModel.findOne.mockReturnValueOnce({
			exec: jest.fn().mockResolvedValue(null),
		} as any);

		await expect(ninaWarningsChecker.getNewWarnings()).resolves.toEqual([
			expectedWarning,
		]);

		expect(httpService.get).toHaveBeenCalledWith(
			'https://nina.api.proxy.bund.dev/api31/katwarn/mapData.json',
		);
		expect(httpService.get).toHaveBeenCalledWith(
			'https://nina.api.proxy.bund.dev/api31/warnings/1.json',
		);
		expect(httpService.get).toHaveBeenCalledWith(
			'https://nina.api.proxy.bund.dev/api31/warnings/1.geojson',
		);

		expect(warningModel.create).toHaveBeenCalledWith(expectedWarning);
		expect(warningModel.deleteMany).toHaveBeenCalledWith({
			sourceId: { $nin: ['1'] },
		});
	});

	it('should replace an existing warning with a different version', async () => {
		const mockData = { id: '1', version: 2 };
		const mockWarning = new Warning();
		mockWarning.sourceVersion = 1;

		httpService.get
			.mockReturnValueOnce(of({ data: [mockData] } as AxiosResponse))
			.mockReturnValueOnce(of({ data: EXAMPLE_WARNING_INFO } as AxiosResponse))
			.mockReturnValueOnce(
				of({ data: EXAMPLE_WARNING_GEOJSON } as AxiosResponse),
			);
		const replaceOne = jest.fn();
		warningModel.findOne.mockReturnValueOnce({
			exec: jest.fn().mockResolvedValue({
				replaceOne: replaceOne.mockReturnValue({
					exec: jest.fn().mockResolvedValue(undefined),
				}),
				sourceVersion: 1,
			}),
		} as any);

		await expect(ninaWarningsChecker.getNewWarnings()).resolves.toContainEqual(
			expect.objectContaining({
				sourceId: '1',
				sourceVersion: 2,
			}),
		);

		expect(replaceOne).toHaveBeenCalledWith(
			expect.objectContaining({ sourceId: '1', sourceVersion: 2 }),
		);
	});

	it('should not replace an existing warning with the same version', async () => {
		httpService.get
			.mockReturnValueOnce(
				of({ data: [{ id: '1', version: 1 }] } as AxiosResponse),
			)
			.mockReturnValueOnce(of({ data: EXAMPLE_WARNING_INFO } as AxiosResponse))
			.mockReturnValueOnce(
				of({ data: EXAMPLE_WARNING_GEOJSON } as AxiosResponse),
			);

		const replaceOne = jest.fn();
		warningModel.findOne.mockReturnValueOnce({
			exec: jest.fn().mockResolvedValue({
				replaceOne: replaceOne.mockReturnValue({
					exec: jest.fn().mockResolvedValue(undefined),
				}),
				sourceVersion: 1,
			}),
		} as any);

		await expect(ninaWarningsChecker.getNewWarnings()).resolves.toHaveLength(0);

		expect(replaceOne).not.toHaveBeenCalled();
	});
});
