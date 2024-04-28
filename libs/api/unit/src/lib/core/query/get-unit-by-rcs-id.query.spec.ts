import { Test } from '@nestjs/testing';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';
import { GetUnitByRCSIDHandler } from './get-unit-by-rcs-id.query';

describe('GetUnitByRCSIDHandler', () => {
	let getUnitByRCSIDHandler: GetUnitByRCSIDHandler;
	let mockUnitRepository: jest.Mocked<UnitRepository>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				GetUnitByRCSIDHandler,
				{
					provide: UNIT_REPOSITORY,
					useValue: {
						findByRcsId: jest.fn(),
					},
				},
			],
		}).compile();

		getUnitByRCSIDHandler = moduleRef.get<GetUnitByRCSIDHandler>(
			GetUnitByRCSIDHandler,
		);
		mockUnitRepository =
			moduleRef.get<jest.Mocked<UnitRepository>>(UNIT_REPOSITORY);
	});

	it('should return unit by organization id and RCS id', async () => {
		const mockUnit = new UnitEntity();
		mockUnit.name = 'Test Unit';

		mockUnitRepository.findByRcsId.mockResolvedValue(mockUnit);

		const result = await getUnitByRCSIDHandler.execute({
			orgId: 'orgId',
			rcsId: 'rcsId',
		});

		expect(result).toEqual(mockUnit);
		expect(mockUnitRepository.findByRcsId).toHaveBeenCalledWith(
			'orgId',
			'rcsId',
		);
	});
});
