import { Test } from '@nestjs/testing';

import { AlertGroupEntity } from '../entity/alert-group.entity';
import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';
import { GetAlertGroupsByOrgHandler } from './get-alert-groups-by.org.query';

describe('GetAlertGroupsByOrgHandler', () => {
	let getAlertGroupsByOrgHandler: GetAlertGroupsByOrgHandler;
	let mockAlertGroupRepository: jest.Mocked<AlertGroupRepository>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				GetAlertGroupsByOrgHandler,
				{
					provide: ALERT_GROUP_REPOSITORY,
					useValue: {
						findByOrgId: jest.fn(),
					},
				},
			],
		}).compile();

		getAlertGroupsByOrgHandler = moduleRef.get<GetAlertGroupsByOrgHandler>(
			GetAlertGroupsByOrgHandler,
		);
		mockAlertGroupRepository = moduleRef.get<jest.Mocked<AlertGroupRepository>>(
			ALERT_GROUP_REPOSITORY,
		);
	});

	it('should return alert groups by organization id', async () => {
		const mockAlertGroup = new AlertGroupEntity();
		mockAlertGroup.name = 'Test Alert Group';

		mockAlertGroupRepository.findByOrgId.mockResolvedValue([mockAlertGroup]);

		const result = await getAlertGroupsByOrgHandler.execute({ orgId: 'orgId' });

		expect(result).toEqual([mockAlertGroup]);
		expect(mockAlertGroupRepository.findByOrgId).toHaveBeenCalledWith('orgId');
	});
});
