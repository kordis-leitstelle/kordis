import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { Model } from 'mongoose';
import { NEVER, of } from 'rxjs';

import { Warning } from '../../core/model/warning.model';
import { NINA_SOURCES_TOKEN } from './nina-sources';
import { NinaWarningsService } from './nina-warnings.service';

describe('NinaWarningService', () => {
	let warningService: NinaWarningsService;
	let mockHttpService: DeepMocked<HttpService>;
	let mockWarningModel: DeepMocked<Model<Warning>>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				NinaWarningsService,
				{
					provide: HttpService,
					useValue: createMock<HttpService>(),
				},
				{
					provide: getModelToken(Warning.name),
					useValue: createMock<Model<Warning>>(),
				},
				{
					provide: NINA_SOURCES_TOKEN,
					useValue: [
						'https://nina.api.proxy.bund.dev/api31/katwarn/mapData.json',
					],
				},
			],
		}).compile();

		warningService = moduleRef.get<NinaWarningsService>(NinaWarningsService);
		mockHttpService = moduleRef.get<DeepMocked<HttpService>>(HttpService);
		mockWarningModel = moduleRef.get<DeepMocked<Model<Warning>>>(
			getModelToken(Warning.name),
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return warnings for the given location', async () => {
		const warnings: Warning[] = [
			{
				sourceId: 'example-source-id',
				sourceVersion: 1,
				sentAt: new Date(),
				sender: 'John Doe',
				severity: 'High',
				effective: new Date('2023-07-23T12:00:00Z'),
				expires: new Date('2023-07-25T12:00:00Z'),
				title: 'Example Warning Title',
				description: 'This is an example warning description.',
				instruction: 'Follow safety guidelines.',
				affectedLocations: {
					type: 'GeometryCollection',
					geometries: [],
				},
			},
		];
		mockWarningModel.where.mockImplementationOnce(
			() =>
				({
					intersects: jest.fn().mockReturnThis(),
					lean: jest.fn().mockReturnThis(),
					exec: jest.fn().mockResolvedValueOnce(warnings),
				} as any),
		);

		const result = await warningService.getWarningsForLocation(55.5, 9.9);

		expect(result).toEqual(warnings);
	});

	describe('getNewWarnings', () => {
		it('should fetch new warnings and save them in the database', async () => {
			mockHttpService.get.mockImplementation((url: string) => {
				if (url.includes('mapData.json')) {
					return of({
						data: [
							// new warnings that should be created
							{ id: 'warning_1', version: 1 },
							{ id: 'warning_2', version: 2 },
						],
					} as AxiosResponse);
				} else if (url.includes('.json')) {
					return of({
						data: {
							identifier: 'warning_1',
							sent: '2023-07-23T12:00:00Z',
							sender: 'Sender Name',
							info: [
								{
									language: 'de',
									senderName: 'Some Sender',
									severity: 'Moderate',
									effective: '2023-07-24T12:00:00Z',
									expires: '2023-07-25T12:00:00Z',
									headline: 'Warning Headline',
									description: 'Warning Description',
									instruction: 'Warning Instruction',
								},
							],
						},
					} as AxiosResponse);
				} else if (url.includes('.geojson')) {
					return of({
						data: {
							type: 'FeatureCollection',
							features: [
								{
									type: 'Feature',
									geometry: {},
								},
							],
						},
					} as AxiosResponse);
				}
				return NEVER;
			});

			mockWarningModel.findOne.mockResolvedValue(null); // No existing warnings

			const newWarnings = await warningService.getNewWarnings();

			expect(mockWarningModel.create).toHaveBeenCalledTimes(2); // 2 created warnings
			expect(newWarnings).toHaveLength(2);
		});

		it('should update existing warnings in the database if the version is different', async () => {
			mockHttpService.get.mockImplementation((url: string) => {
				if (url.includes('mapData.json')) {
					return of({
						// existing warning that should be updated
						data: [{ id: 'existing_warning_source_id', version: 2 }],
					} as AxiosResponse);
				} else if (url.includes('.json')) {
					return of({
						data: {
							identifier: 'existing_warning_source_id',
							sent: '2023-07-23T12:00:00Z',
							sender: 'Sender Name',
							info: [
								{
									language: 'de',
									senderName: 'Some Sender',
									severity: 'Moderate',
									effective: '2023-07-24T12:00:00Z',
									expires: '2023-07-25T12:00:00Z',
									headline: 'Warning Headline',
									description: 'Warning Description',
									instruction: 'Warning Instruction',
								},
							],
						},
					} as AxiosResponse);
				} else if (url.includes('.geojson')) {
					return of({
						data: {
							type: 'FeatureCollection',
							features: [
								{
									type: 'Feature',
									geometry: {},
								},
							],
						},
					} as AxiosResponse);
				}
				return NEVER;
			});
			const replaceOneMock = jest.fn().mockImplementation(() => ({
				exec: jest.fn(),
			}));
			const existingWarning = {
				_id: 'existing_warning_db_id',
				sourceId: 'existing_warning_source_id',
				sourceVersion: 1,
				replaceOne: replaceOneMock,
			};
			mockWarningModel.findOne.mockResolvedValueOnce(existingWarning);

			const newWarnings = await warningService.getNewWarnings();

			expect(newWarnings).toHaveLength(1);
			expect(replaceOneMock).toHaveBeenCalledWith({
				sourceId: 'existing_warning_source_id',
				sourceVersion: 2,
				affectedLocations: {
					geometries: [{}],
					type: 'GeometryCollection',
				},
				title: 'Warning Headline',
				description: 'Warning Description',
				effective: new Date('2023-07-24T12:00:00.000Z'),
				expires: new Date('2023-07-25T12:00:00.000Z'),
				instruction: 'Warning Instruction',
				sender: 'Some Sender',
				sentAt: new Date('2023-07-23T12:00:00.000Z'),
				severity: 'Moderate',
			});
		});

		it('should delete warnings from the database if they are no longer present in the sources', async () => {
			const source1Warnings = [{ id: 'warning_1', version: 1 }];
			mockHttpService.get.mockReturnValueOnce(
				of({ data: source1Warnings } as AxiosResponse),
			);

			mockWarningModel.findOne.mockResolvedValueOnce({
				_id: 'warning_1_id',
				sourceId: 'warning_1',
				sourceVersion: 1,
			});

			const newWarnings = await warningService.getNewWarnings();
			expect(newWarnings).toHaveLength(0);
			expect(mockWarningModel.deleteMany).toHaveBeenCalledWith({
				sourceId: { $nin: ['warning_1'] },
			});
		});
	});
});
