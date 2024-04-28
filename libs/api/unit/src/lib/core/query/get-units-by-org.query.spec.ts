import { Test } from '@nestjs/testing';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';
import { GetUnitsByOrgHandler } from './get-units-by-org.query';

describe('GetUnitsByOrgHandler', () => {
	let getUnitsByOrgHandler: GetUnitsByOrgHandler;
	let mockUnitRepository: jest.Mocked<UnitRepository>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				GetUnitsByOrgHandler,
				{
					provide: UNIT_REPOSITORY,
					useValue: {
						findByOrg: jest.fn(),
					},
				},
			],
		}).compile();

		getUnitsByOrgHandler =
			moduleRef.get<GetUnitsByOrgHandler>(GetUnitsByOrgHandler);
		mockUnitRepository =
			moduleRef.get<jest.Mocked<UnitRepository>>(UNIT_REPOSITORY);
	});

	it('should return units by organization id', async () => {
		const entity1 = new UnitEntity();
		entity1.name = 'name1';

		const entity2 = new UnitEntity();
		entity2.name = 'name2';
		mockUnitRepository.findByOrg.mockResolvedValue([entity1, entity2]);

		const result = await getUnitsByOrgHandler.execute({ orgId: 'orgId' });

		expect(result).toEqual([entity1, entity2]);
		expect(mockUnitRepository.findByOrg).toHaveBeenCalledWith('orgId');
	});
});
