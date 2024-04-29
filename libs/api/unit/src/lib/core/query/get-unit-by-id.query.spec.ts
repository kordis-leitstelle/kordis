import { Test } from '@nestjs/testing';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';
import { GetUnitByIdHandler } from './get-unit-by-id.query';

describe('GetUnitByIdHandler', () => {
	let getUnitByIdHandler: GetUnitByIdHandler;
	let mockUnitRepository: jest.Mocked<UnitRepository>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				GetUnitByIdHandler,
				{
					provide: UNIT_REPOSITORY,
					useValue: {
						findById: jest.fn(),
					},
				},
			],
		}).compile();

		getUnitByIdHandler = moduleRef.get<GetUnitByIdHandler>(GetUnitByIdHandler);
		mockUnitRepository =
			moduleRef.get<jest.Mocked<UnitRepository>>(UNIT_REPOSITORY);
	});

	it('should return unit by organization id and unit id', async () => {
		const mockUnit = new UnitEntity();
		mockUnit.name = 'Test Unit';

		mockUnitRepository.findById.mockResolvedValue(mockUnit);

		const result = await getUnitByIdHandler.execute({
			orgId: 'orgId',
			id: '1',
		});

		expect(result).toEqual(mockUnit);
		expect(mockUnitRepository.findById).toHaveBeenCalledWith('orgId', '1');
	});
});
