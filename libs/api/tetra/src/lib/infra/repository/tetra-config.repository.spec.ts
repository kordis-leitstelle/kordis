import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';

import { mockModelMethodResult } from '@kordis/api/test-helpers';

import { TetraConfig } from '../../core/entity/tetra-config.entitiy';
import { TetraConfigRepository } from '../../core/repository/tetra-config.repository';
import { TetraConfigDocument } from '../schema/tetra-config.schema';
import { TetraConfigMapperProfile } from '../tetra-config.mapper-profile';
import { TetraConfigRepositoryImpl } from './tetra-config.repository';

describe('TetraConfigRepository', () => {
	let repository: TetraConfigRepository;
	let tetraConfigModel: Model<TetraConfigDocument>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				TetraConfigMapperProfile,
				TetraConfigRepositoryImpl,
				{
					provide: getModelToken(TetraConfigDocument.name),
					useValue: createMock<Model<TetraConfigDocument>>(),
				},
			],
		}).compile();

		repository = moduleRef.get<TetraConfigRepositoryImpl>(
			TetraConfigRepositoryImpl,
		);
		tetraConfigModel = moduleRef.get<Model<TetraConfigDocument>>(
			getModelToken(TetraConfigDocument.name),
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('findByOrgId', () => {
		it('should return tetra config', async () => {
			const orgId = 'orgId';
			const expected: TetraConfig = new TetraConfig();
			expected.orgId = orgId;
			expected.tetraControlApiUrl = 'url';
			expected.tetraControlApiUserKey = 'userKey';
			expected.webhookAccessKey = 'webhook access key';

			mockModelMethodResult(tetraConfigModel, expected, 'findOne');

			const result = await repository.findByOrgId(orgId);

			expect(result).toEqual(expected);
		});

		it('should return null if no result', async () => {
			mockModelMethodResult(tetraConfigModel, null, 'findOne');

			const result = await repository.findByOrgId('orgId');

			expect(result).toEqual(null);
		});
	});

	describe('findByWebhookAccessKey', () => {
		it('should return tetra config', async () => {
			const accessKey = 'accessKey';
			const expected: TetraConfig = new TetraConfig();
			expected.orgId = 'orgId';
			expected.tetraControlApiUrl = 'url';
			expected.tetraControlApiUserKey = 'userKey';
			expected.webhookAccessKey = accessKey;

			mockModelMethodResult(tetraConfigModel, expected, 'findOne');

			const result = await repository.findByWebhookAccessKey(accessKey);

			expect(result).toEqual(expected);
		});

		it('should return null if no result', async () => {
			mockModelMethodResult(tetraConfigModel, null, 'findOne');

			const result = await repository.findByWebhookAccessKey('orgId');

			expect(result).toEqual(null);
		});
	});
});
