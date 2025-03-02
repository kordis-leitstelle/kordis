import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { BaseModelProfile } from '@kordis/api/shared';
import {
	mockModelMethodResult,
	mockModelMethodResults,
} from '@kordis/api/test-helpers';

import { OperationDeploymentEntity } from '../../../core/entity/operation-deplyoment.entity';
import { DeploymentAggregateProfile } from '../../mapper/deployment-aggregate.mapper-profile';
import { DeploymentAssignmentProfile } from '../../mapper/deployment-assignment.mapper-profile';
import { OperationDeploymentAggregateProfile } from '../../mapper/operation-deployment-aggregate.mapper-profile';
import { OperationDeploymentDocument } from '../../schema/operation-deployment.schema';
import { OperationDeploymentRepositoryImpl } from './operation-deployment.repository';

describe('OperationDeploymentRepositoryImpl', () => {
	let repository: OperationDeploymentRepositoryImpl;
	let operationDeploymentDocument: Model<OperationDeploymentDocument>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				OperationDeploymentRepositoryImpl,
				BaseModelProfile,
				DeploymentAggregateProfile,
				DeploymentAssignmentProfile,
				OperationDeploymentAggregateProfile,
				{
					provide: getModelToken(OperationDeploymentDocument.name),
					useValue: createMock<Model<OperationDeploymentDocument>>(),
				},
			],
		}).compile();

		repository = module.get<OperationDeploymentRepositoryImpl>(
			OperationDeploymentRepositoryImpl,
		);
		operationDeploymentDocument = module.get<
			Model<OperationDeploymentDocument>
		>(getModelToken(OperationDeploymentDocument.name));
	});

	it('should find operation deployment by id', async () => {
		const orgId = 'org1';
		const id = '67a895e3298674a23d194ed5';
		const operationId = '67a8b23a45a05e8bc981fc1b';
		const mockOperationDeployment = {
			_id: id,
			orgId,
			operationId,
		};

		mockModelMethodResults(
			operationDeploymentDocument,
			[mockOperationDeployment],
			'aggregate',
		);

		const result = await repository.findById(orgId, id);
		expect(result).toBeInstanceOf(OperationDeploymentEntity);
		expect(result.id).toBe(id);
		expect(result.orgId).toBe(orgId);
		expect(result.operation.id).toEqual(operationId);
	});

	it('should find deployments by org id', async () => {
		const mockDeployments = [
			{
				_id: 'id1',
				orgId: 'orgId',
				operationId: 'operationId1',
			},
			{
				_id: 'id2',
				orgId: 'orgId',
				operationId: 'operationId2',
			},
		];

		mockModelMethodResults(
			operationDeploymentDocument,
			mockDeployments,
			'aggregate',
		);

		const result = await repository.findByOrgId('orgId');

		expect(result[0]).toBeInstanceOf(OperationDeploymentEntity);
		expect(result[0].id).toBe('id1');
		expect(result[0].orgId).toBe('orgId');
		expect(result[0].operation.id).toEqual('operationId1');
		expect(result[1]).toBeInstanceOf(OperationDeploymentEntity);
		expect(result[1].id).toBe('id2');
		expect(result[1].orgId).toBe('orgId');
		expect(result[1].operation.id).toEqual('operationId2');
	});

	it('should find by operation id', async () => {
		const orgId = 'org1';
		const id = '67a895e3298674a23d194ed5';
		const operationId = '67a8b23a45a05e8bc981fc1b';
		const mockOperationDeploymentDoc = {
			_id: id,
			orgId,
			operationId,
		};

		mockModelMethodResult(
			operationDeploymentDocument,
			mockOperationDeploymentDoc,
			'findOne',
		);

		const result = await repository.findByOperationId(orgId, operationId);
		expect(result).toBeInstanceOf(OperationDeploymentEntity);
		expect(result.id).toBe(id);
		expect(result.orgId).toBe(orgId);
		expect(result.operation.id).toEqual(operationId);
	});

	it('should create operation deployment', async () => {
		const orgId = 'org1';
		const operationId = 'operationId';
		const id = 'id';
		const mockOperationDeploymentDoc = {
			_id: id,
			orgId,
			operationId,
		};

		mockModelMethodResult(
			operationDeploymentDocument,
			mockOperationDeploymentDoc,
			'findOne',
		);

		const res = await repository.create(orgId, operationId);
		expect(res.id).toEqual(id);
		expect(res.operation.id).toEqual(operationId);
		expect(res.orgId).toEqual(orgId);
		expect(operationDeploymentDocument.create).toHaveBeenCalledWith(
			[{ orgId, operationId }],
			expect.anything(),
		);
	});

	it('should remove operation deployment', async () => {
		const orgId = 'org1';
		const operationId = 'operationId';

		await repository.remove(orgId, operationId);

		expect(operationDeploymentDocument.deleteOne).toHaveBeenCalledWith({
			orgId,
			operationId,
		});
	});
});
