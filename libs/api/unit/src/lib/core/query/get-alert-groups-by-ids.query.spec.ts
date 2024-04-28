import { Test } from '@nestjs/testing';

import { AlertGroupEntity } from '../entity/alert-group.entity';
import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';
import { GetAlertGroupsByIdsHandler } from './get-alert-groups-by-ids.query';

describe('GetAlertGroupsByIdsHandler', () => {
	let getAlertGroupsByIdsHandler: GetAlertGroupsByIdsHandler;
	let mockAlertGroupRepository: jest.Mocked<AlertGroupRepository>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				GetAlertGroupsByIdsHandler,
				{
					provide: ALERT_GROUP_REPOSITORY,
					useValue: {
						findByIds: jest.fn(),
					},
				},
			],
		}).compile();

		getAlertGroupsByIdsHandler = moduleRef.get<GetAlertGroupsByIdsHandler>(
			GetAlertGroupsByIdsHandler,
		);
		mockAlertGroupRepository = moduleRef.get<jest.Mocked<AlertGroupRepository>>(
			ALERT_GROUP_REPOSITORY,
		);
	});

	it('should return alert groups by ids', async () => {
		const entity1 = new AlertGroupEntity();
		entity1.name = 'Alert Group 1';
		const entity2 = new AlertGroupEntity();
		entity2.name = 'Alert Group 2';
		mockAlertGroupRepository.findByIds.mockResolvedValue([entity1, entity2]);

		const result = await getAlertGroupsByIdsHandler.execute({
			ids: ['1', '2'],
		});

		expect(result).toEqual([entity1, entity2]);
		expect(mockAlertGroupRepository.findByIds).toHaveBeenCalledWith(['1', '2']);
	});
});
