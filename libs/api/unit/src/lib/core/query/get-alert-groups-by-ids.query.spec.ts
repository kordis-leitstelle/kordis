import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import { RetainOrderService } from '@kordis/api/shared';

import { AlertGroupEntity } from '../entity/alert-group.entity';
import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';
import {
	GetAlertGroupsByIdsHandler,
	GetAlertGroupsByIdsQuery,
} from './get-alert-groups-by-ids.query';

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
				RetainOrderService,
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
		const orgId = '123';
		const entity1 = plainToInstance(AlertGroupEntity, { id: '1' });
		const entity2 = plainToInstance(AlertGroupEntity, { id: '2' });
		mockAlertGroupRepository.findByIds.mockResolvedValue([entity2, entity1]);

		const result = await getAlertGroupsByIdsHandler.execute(
			new GetAlertGroupsByIdsQuery(['1', '2'], orgId, { retainOrder: true }),
		);

		expect(result).toEqual([entity1, entity2]);
		expect(mockAlertGroupRepository.findByIds).toHaveBeenCalledWith(
			['1', '2'],
			orgId,
		);
	});
});
