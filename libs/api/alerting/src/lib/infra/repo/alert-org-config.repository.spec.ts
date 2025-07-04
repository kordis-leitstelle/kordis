import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';

import { ConfigNotFoundError } from '../error/config-not-found.error';
import { AlertOrgConfigProfile } from '../mapper/alert-org-config.mapper';
import {
	AlertOrgConfigBaseDocument,
	AlertingProviders,
} from '../schema/alerting-org-config.schema';
import { AlertOrgConfigRepositoryImpl } from './alert-org-config.repository';

describe('AlertOrgConfigRepositoryImpl', () => {
	let alertOrgConfigRepository: AlertOrgConfigRepositoryImpl;
	let mockAlertOrgConfigModel: jest.Mocked<Model<AlertOrgConfigBaseDocument>>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				AlertOrgConfigRepositoryImpl,
				{
					provide: getModelToken(AlertOrgConfigBaseDocument.name),
					useValue: createMock<Model<AlertOrgConfigBaseDocument>>(),
				},
				AlertOrgConfigProfile,
			],
		}).compile();

		alertOrgConfigRepository = moduleRef.get<AlertOrgConfigRepositoryImpl>(
			AlertOrgConfigRepositoryImpl,
		);
		mockAlertOrgConfigModel = moduleRef.get<
			jest.Mocked<Model<AlertOrgConfigBaseDocument>>
		>(getModelToken(AlertOrgConfigBaseDocument.name));
	});

	it('should retrieve org config by orgId', async () => {
		const mockData = {
			orgId: 'org1',
			type: AlertingProviders.DIVERA,
			token: 'token',
		};

		mockAlertOrgConfigModel.findOne.mockReturnValueOnce({
			lean: jest.fn().mockReturnValueOnce({
				exec: jest.fn().mockResolvedValueOnce(mockData),
			}),
		} as any);

		const result = await alertOrgConfigRepository.findByOrgId('org1');

		expect(mockAlertOrgConfigModel.findOne).toHaveBeenCalledWith({
			orgId: 'org1',
		});
		expect(result).toEqual({
			orgId: 'org1',
			token: 'token',
		});
	});

	it('should throw ConfigNotFoundError if no config is found', async () => {
		mockAlertOrgConfigModel.findOne.mockReturnValueOnce({
			lean: jest.fn().mockReturnValueOnce({
				exec: jest.fn().mockResolvedValueOnce(null),
			}),
		} as any);

		await expect(alertOrgConfigRepository.findByOrgId('org1')).rejects.toThrow(
			ConfigNotFoundError,
		);
		expect(mockAlertOrgConfigModel.findOne).toHaveBeenCalledWith({
			orgId: 'org1',
		});
	});
});
