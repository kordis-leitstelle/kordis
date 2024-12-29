import { Test, TestingModule } from '@nestjs/testing';

import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';
import {
	UpdateCurrentAlertGroupUnitsCommand,
	UpdateCurrentAlertGroupUnitsHandler,
} from './update-current-alert-group-units.command';

describe('UpdateCurrentAlertGroupUnitsHandler', () => {
	let handler: UpdateCurrentAlertGroupUnitsHandler;
	let repository: AlertGroupRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UpdateCurrentAlertGroupUnitsHandler,
				{
					provide: ALERT_GROUP_REPOSITORY,
					useValue: {
						updateCurrentUnits: jest.fn(),
					},
				},
			],
		}).compile();

		handler = module.get<UpdateCurrentAlertGroupUnitsHandler>(
			UpdateCurrentAlertGroupUnitsHandler,
		);
		repository = module.get<AlertGroupRepository>(ALERT_GROUP_REPOSITORY);
	});

	it('should update current units for the given alert group', async () => {
		const command = new UpdateCurrentAlertGroupUnitsCommand(
			'orgId',
			'alertGroupId',
			['unitId1', 'unitId2'],
		);
		await handler.execute(command);
		expect(repository.updateCurrentUnits).toHaveBeenCalledWith(
			'orgId',
			'alertGroupId',
			['unitId1', 'unitId2'],
		);
	});
});
