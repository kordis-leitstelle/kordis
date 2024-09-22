import { Test, TestingModule } from '@nestjs/testing';

import {
	ALERT_GROUP_REPOSITORY,
	AlertGroupRepository,
} from '../repository/alert-group.repository';
import {
	ResetAlertGroupUnitsCommand,
	ResetAlertGroupUnitsHandler,
} from './reset-alert-group-units.command';

describe('ResetAlertGroupUnitsHandler', () => {
	let handler: ResetAlertGroupUnitsHandler;
	let repository: AlertGroupRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResetAlertGroupUnitsHandler,
				{
					provide: ALERT_GROUP_REPOSITORY,
					useValue: {
						resetCurrentUnitsToDefaultUnits: jest.fn(),
					},
				},
			],
		}).compile();

		handler = module.get<ResetAlertGroupUnitsHandler>(
			ResetAlertGroupUnitsHandler,
		);
		repository = module.get<AlertGroupRepository>(ALERT_GROUP_REPOSITORY);
	});

	it('should reset current units to default units', async () => {
		const command = new ResetAlertGroupUnitsCommand('orgId');
		await handler.execute(command);
		expect(repository.resetCurrentUnitsToDefaultUnits).toHaveBeenCalledWith(
			'orgId',
		);
	});
});
