import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';

import { mockModelMethodResults } from '@kordis/api/test-helpers';

import { AlertGroupDiveraCOnfig } from '../../core/entity/alert-group-config.entity';
import { AlertGroupConfigProfile } from '../mapper/alert-group-config.mapper';
import {
	AlertGroupConfigBaseDocument,
	AlertGroupDiveraConfigDocument,
} from '../schema/alert-group-config.schema';
import { AlertingProviders } from '../schema/alerting-org-config.schema';
import { AlertGroupConfigRepositoryImpl } from './alert-group-config.repository';

describe('AlertGroupConfigRepositoryImpl', () => {
	let alertGroupConfigRepository: AlertGroupConfigRepositoryImpl;
	let mockAlertGroupConfigModel: jest.Mocked<
		Model<AlertGroupConfigBaseDocument>
	>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				AlertGroupConfigRepositoryImpl,
				{
					provide: getModelToken(AlertGroupConfigBaseDocument.name),
					useValue: createMock<Model<AlertGroupConfigBaseDocument>>(),
				},
				AlertGroupConfigProfile,
			],
		}).compile();

		alertGroupConfigRepository = moduleRef.get<AlertGroupConfigRepositoryImpl>(
			AlertGroupConfigRepositoryImpl,
		);
		mockAlertGroupConfigModel = moduleRef.get<
			jest.Mocked<Model<AlertGroupConfigBaseDocument>>
		>(getModelToken(AlertGroupConfigBaseDocument.name));
	});

	it('should retrieve alert group configs by alertGroupIds and orgId', async () => {
		const mockData = [
			{
				type: AlertingProviders.DIVERA,
				alertGroupId: 'group1',
				orgId: 'org1',
				diveraGroupId: 'divera1',
			} as AlertGroupDiveraConfigDocument,
			{
				type: AlertingProviders.DIVERA,
				alertGroupId: 'group2',
				orgId: 'org1',
				diveraGroupId: 'divera2',
			} as AlertGroupDiveraConfigDocument,
		];

		mockModelMethodResults(mockAlertGroupConfigModel, mockData, 'find');

		const result = await alertGroupConfigRepository.getAlertGroupConfigs(
			['group1', 'group2'],
			'org1',
		);

		expect(mockAlertGroupConfigModel.find).toHaveBeenCalledWith({
			alertGroupId: { $in: ['group1', 'group2'] },
			orgId: 'org1',
		});
		expect(result).toEqual([
			{
				alertGroupId: 'group1',
				diveraGroupId: 'divera1',
				orgId: 'org1',
			},
			{
				alertGroupId: 'group2',
				diveraGroupId: 'divera2',
				orgId: 'org1',
			},
		]);
		expect(result[0]).toBeInstanceOf(AlertGroupDiveraCOnfig);
	});
});
