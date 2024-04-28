import { Test } from '@nestjs/testing';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';
import { GetUnitsByIdsHandler } from './get-units-by-ids.query';

describe('GetUnitsByIdsHandler', () => {
	let getUnitsByIdsHandler: GetUnitsByIdsHandler;
	let mockUnitRepository: jest.Mocked<UnitRepository>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				GetUnitsByIdsHandler,
				{
					provide: UNIT_REPOSITORY,
					useValue: {
						findByIds: jest.fn(),
					},
				},
			],
		}).compile();

		getUnitsByIdsHandler =
			moduleRef.get<GetUnitsByIdsHandler>(GetUnitsByIdsHandler);
		mockUnitRepository =
			moduleRef.get<jest.Mocked<UnitRepository>>(UNIT_REPOSITORY);
	});

	it('should return units by ids', async () => {
		const entity1 = new UnitEntity();
		entity1.name = 'unit1';

		const entity2 = new UnitEntity();
		entity2.name = 'unit2';

		mockUnitRepository.findByIds.mockResolvedValue([entity1, entity2]);

		const result = await getUnitsByIdsHandler.execute({ ids: ['1', '2'] });

		expect(result).toEqual([entity1, entity2]);
		expect(mockUnitRepository.findByIds).toHaveBeenCalledWith(['1', '2']);
	});
});
