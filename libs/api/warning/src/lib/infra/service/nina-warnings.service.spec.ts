import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Warning } from '../../core/model/warning.model';
import { NINA_SOURCES_TOKEN } from './nina-sources';
import { NinaWarningsService } from './nina-warnings.service';
import {
	GEOSPATIAL_SERVICE,
	GeospatialModule,
	GeospatialService,
} from '@kordis/api/geospatial';
import { point } from '@turf/turf';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { BackgroundJob } from '@kordis/api/shared';

describe('NinaWarningService', () => {
	let warningService: NinaWarningsService;
	let mockWarningModel: DeepMocked<Model<Warning>>;
	let ninaChangeStreamSubject$: ReplaySubject<Warning>;
	let mockNinaBackgroundJob: DeepMocked<BackgroundJob<Warning>>;

	beforeEach(async () => {
		ninaChangeStreamSubject$ = new ReplaySubject<Warning>(1);
		mockNinaBackgroundJob = {
			getChangeStream$: jest.fn().mockReturnValue(ninaChangeStreamSubject$),
		};

		const moduleRef = await Test.createTestingModule({
			providers: [
				{
					provide: NinaWarningsService,
					useFactory: (
						http: HttpService,
						geospatialService: GeospatialService,
						model: Model<Warning>,
					) => {
						return new NinaWarningsService(
							mockNinaBackgroundJob,
							model,
							geospatialService,
						);
					},
					inject: [
						HttpService,
						GEOSPATIAL_SERVICE,
						getModelToken(Warning.name),
					],
				},
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
			imports: [GeospatialModule],
		}).compile();

		warningService = moduleRef.get<NinaWarningsService>(NinaWarningsService);
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
				}) as any,
		);

		const result = await warningService.getWarningsForLocation(55.5, 9.9);

		expect(result).toEqual(warnings);
	});

	describe('getWarningsInGeometryStream$', () => {
		it('should only emit warnings that intersect with the given geometry', async () => {
			const warning = {
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
					geometries: [
						{
							type: 'Point',
							coordinates: [9.9, 55.5],
						},
					],
				},
			} as Warning;

			ninaChangeStreamSubject$.next(warning);

			const result = await firstValueFrom(
				warningService.getWarningsInGeometryStream$(point([9.9, 55.5])),
			);

			expect(result).toEqual(warning);
		});
	});
});
