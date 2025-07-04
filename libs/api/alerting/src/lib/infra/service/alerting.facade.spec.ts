import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { OperationViewModel } from '@kordis/api/operation';

import { AlertGroupDiveraCOnfig } from '../../core/entity/alert-group-config.entity';
import { DiveraOrgConfig } from '../../core/entity/alert-org-config.entity';
import {
	ALERT_GROUP_CONFIG_REPOSITORY,
	AlertGroupConfigRepository,
} from '../../core/repo/alert-group-config.repository';
import {
	ALERT_ORG_CONFIG_REPOSITORY,
	AlertOrgConfigRepository,
} from '../../core/repo/alert-org-config.repository';
import { AlertingProviders } from '../schema/alerting-org-config.schema';
import { DiveraProvider } from './alert-provider/divera.provider';
import { AlertingFacade } from './alerting.facade';

describe('AlertingFacade', () => {
	let alertingFacade: AlertingFacade;
	let mockConfigRepo: jest.Mocked<AlertOrgConfigRepository>;
	let mockAlertGroupConfigRepo: jest.Mocked<AlertGroupConfigRepository>;
	let mockDiveraProvider: jest.Mocked<DiveraProvider>;

	beforeEach(async () => {
		mockConfigRepo = createMock();
		mockAlertGroupConfigRepo = createMock();
		mockDiveraProvider = createMock<DiveraProvider>({
			provider: AlertingProviders.DIVERA,
		});

		const moduleRef = await Test.createTestingModule({
			providers: [
				AlertingFacade,
				{ provide: ALERT_ORG_CONFIG_REPOSITORY, useValue: mockConfigRepo },
				{
					provide: ALERT_GROUP_CONFIG_REPOSITORY,
					useValue: mockAlertGroupConfigRepo,
				},
				{
					provide: 'ALERT_PROVIDERS',
					useValue: [mockDiveraProvider],
				},
			],
		}).compile();

		alertingFacade = moduleRef.get<AlertingFacade>(AlertingFacade);
	});

	it('should call configRepo, alertGroupConfigRepo, and provider correctly', async () => {
		const orgId = 'org1';
		const alertGroupIds = ['group1', 'group2'];
		const operation: OperationViewModel = {
			id: 'op1',
			name: 'Test Operation',
		} as any;
		const hasPriority = true;

		const mockConfig = new DiveraOrgConfig();
		mockConfigRepo.findByOrgId.mockResolvedValue(mockConfig);

		const mockAlertGroupConfigs = [
			{
				id: 'group1',
				alertGroupId: 'alertGroup1',
				diveraGroupId: 'diveraGroup1',
			} as AlertGroupDiveraCOnfig,
			{
				id: 'group2',
				alertGroupId: 'alertGroup2',
				diveraGroupId: 'diveraGroup2',
			} as AlertGroupDiveraCOnfig,
		];
		mockAlertGroupConfigRepo.getAlertGroupConfigs.mockResolvedValue(
			mockAlertGroupConfigs,
		);

		await alertingFacade.alertWithOperation(
			alertGroupIds,
			operation,
			hasPriority,
			orgId,
		);

		expect(mockConfigRepo.findByOrgId).toHaveBeenCalledWith(orgId);
		expect(mockAlertGroupConfigRepo.getAlertGroupConfigs).toHaveBeenCalledWith(
			alertGroupIds,
			orgId,
		);
		expect(mockDiveraProvider.alertWithOperation).toHaveBeenCalledWith(
			mockAlertGroupConfigs,
			operation,
			hasPriority,
			mockConfig,
		);
	});
});
