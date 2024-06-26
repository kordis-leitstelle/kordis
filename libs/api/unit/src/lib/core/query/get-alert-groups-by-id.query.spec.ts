import { Test } from '@nestjs/testing';

import { AlertGroupEntity } from '../entity/alert-group.entity';
import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';
import { GetAlertGroupByIdHandler } from './get-alert-group-by-id.query';

describe('GetAlertGroupsByIdHandler', () => {
	let getAlertGroupsByIdHandler: GetAlertGroupByIdHandler;
	let mockAlertGroupRepository: jest.Mocked<AlertGroupRepository>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				GetAlertGroupByIdHandler,
				{
					provide: ALERT_GROUP_REPOSITORY,
					useValue: {
						findById: jest.fn(),
					},
				},
			],
		}).compile();

		getAlertGroupsByIdHandler = moduleRef.get<GetAlertGroupByIdHandler>(
			GetAlertGroupByIdHandler,
		);
		mockAlertGroupRepository = moduleRef.get<jest.Mocked<AlertGroupRepository>>(
			ALERT_GROUP_REPOSITORY,
		);
	});

	it('should return alert group by organization id and alert group id', async () => {
		const mockAlertGroup = new AlertGroupEntity();
		mockAlertGroup.name = 'Test Alert Group';

		mockAlertGroupRepository.findById.mockResolvedValue(mockAlertGroup);

		const result = await getAlertGroupsByIdHandler.execute({
			orgId: 'orgId',
			id: '1',
		});

		expect(result).toEqual(mockAlertGroup);
		expect(mockAlertGroupRepository.findById).toHaveBeenCalledWith(
			'orgId',
			'1',
		);
	});
});
