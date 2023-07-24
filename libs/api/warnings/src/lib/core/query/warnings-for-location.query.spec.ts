import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { Warning } from '../model/warning.model';
import { WARNING_SERVICE, WarningsService } from '../service/warnings.service';
import {
	WarningsForLocationHandler,
	WarningsForLocationQuery,
} from './warnings-for-location.query';

describe('WarningsForLocationHandler', () => {
	let warningsForLocationHandler: WarningsForLocationHandler;
	let mockWarningsService: DeepMocked<WarningsService>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				WarningsForLocationHandler,
				{
					provide: WARNING_SERVICE,
					useValue: createMock<WarningsService>(),
				},
			],
		}).compile();

		mockWarningsService =
			moduleRef.get<DeepMocked<WarningsService>>(WARNING_SERVICE);
		warningsForLocationHandler = moduleRef.get<WarningsForLocationHandler>(
			WarningsForLocationHandler,
		);
	});

	it('should return warnings for location', async () => {
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
		mockWarningsService.getWarningsForLocation.mockResolvedValueOnce(warnings);

		await expect(
			warningsForLocationHandler.execute(
				new WarningsForLocationQuery(55.5, 9.9),
			),
		).resolves.toEqual(warnings);
	});
});
