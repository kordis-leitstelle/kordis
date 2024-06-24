import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import { RetainOrderService } from '@kordis/api/shared';

import { UnitEntity } from '../entity/unit.entity';
import { UNIT_REPOSITORY, UnitRepository } from '../repository/unit.repository';
import {
	GetUnitsByIdsHandler,
	GetUnitsByIdsQuery,
} from './get-units-by-ids.query';

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
				RetainOrderService,
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

		const result = await getUnitsByIdsHandler.execute(
			new GetUnitsByIdsQuery(['1', '2']),
		);

		expect(result).toEqual([entity1, entity2]);
		expect(mockUnitRepository.findByIds).toHaveBeenCalledWith(['1', '2']);
	});

	it('should keep units in order if retainOrder is true', async () => {
		const entity1 = plainToInstance(UnitEntity, {
			id: '1',
		});

		const entity2 = plainToInstance(UnitEntity, {
			id: '2',
		});

		mockUnitRepository.findByIds.mockResolvedValue([entity2, entity1]);

		const result = await getUnitsByIdsHandler.execute(
			new GetUnitsByIdsQuery(['1', '2'], { retainOrder: true }),
		);

		expect(result).toEqual([entity1, entity2]);
		expect(mockUnitRepository.findByIds).toHaveBeenCalledWith(['1', '2']);
	});

	it('should throw an error for non-existing units', async () => {
		const entity1 = new UnitEntity();
		entity1.name = 'unit1';

		const entity2 = new UnitEntity();
		entity2.name = 'unit2';

		mockUnitRepository.findByIds.mockResolvedValue([entity2, entity1]);

		await expect(async () => {
			await getUnitsByIdsHandler.execute(
				new GetUnitsByIdsQuery(['1', '2', '3'], { retainOrder: true }),
			);
		}).rejects.toThrow();
	});
});
