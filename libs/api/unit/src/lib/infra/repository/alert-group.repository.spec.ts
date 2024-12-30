import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { BaseModelProfile } from '@kordis/api/shared';
import {
	mockModelMethodResult,
	mockModelMethodResults,
} from '@kordis/api/test-helpers';

import { AlertGroupEntity } from '../../core/entity/alert-group.entity';
import { AlertGroupProfile } from '../mapper/alert-group.mapper-profile';
import { AlertGroupDocument } from '../schema/alert-group.schema';
import { AlertGroupRepositoryImpl } from './alert-group.repository';

describe('AlertGroupRepositoryImpl', () => {
	let alertGroupRepository: AlertGroupRepositoryImpl;
	let mockAlertGroupModel: jest.Mocked<Model<AlertGroupDocument>>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				AlertGroupRepositoryImpl,
				BaseModelProfile,
				AlertGroupProfile,
				{
					provide: getModelToken(AlertGroupDocument.name),
					useValue: createMock<AlertGroupDocument>(),
				},
			],
		}).compile();

		alertGroupRepository = moduleRef.get<AlertGroupRepositoryImpl>(
			AlertGroupRepositoryImpl,
		);
		mockAlertGroupModel = moduleRef.get<jest.Mocked<Model<AlertGroupDocument>>>(
			getModelToken(AlertGroupDocument.name),
		);
	});

	it('should find alert groups by organization id', async () => {
		mockModelMethodResults(
			mockAlertGroupModel,
			[
				{
					_id: new Types.ObjectId('662e469a5213ce0cd9b5c473'),
					name: 'alertGroup1',
				},
				{
					_id: new Types.ObjectId('662e46a16d91b65f5cfe6cbb'),
					name: 'alertGroup2',
				},
			],
			'find',
		);

		const result = await alertGroupRepository.findByOrgId('orgId');

		expect(result[0]).toBeInstanceOf(AlertGroupEntity);
		expect(result[0].id).toBe('662e469a5213ce0cd9b5c473');
		expect(result[0].name).toBe('alertGroup1');
		expect(result[1]).toBeInstanceOf(AlertGroupEntity);
		expect(result[1].id).toBe('662e46a16d91b65f5cfe6cbb');
		expect(result[1].name).toBe('alertGroup2');
	});

	it('should find alert group by id', async () => {
		mockModelMethodResult(
			mockAlertGroupModel,
			{
				_id: new Types.ObjectId('662e469a5213ce0cd9b5c473'),
				name: 'alertGroup1',
			},
			'findOne',
		);

		const result = await alertGroupRepository.findById('orgId', 'id');

		expect(result).toBeInstanceOf(AlertGroupEntity);
		expect(result.id).toBe('662e469a5213ce0cd9b5c473');
		expect(result.name).toBe('alertGroup1');
	});

	it('should find alert groups by ids', async () => {
		mockModelMethodResults(
			mockAlertGroupModel,
			[
				{
					_id: new Types.ObjectId('662e469a5213ce0cd9b5c473'),
					name: 'alertGroup1',
				},
				{
					_id: new Types.ObjectId('662e46a16d91b65f5cfe6cbb'),
					name: 'alertGroup2',
				},
			],
			'find',
		);

		const result = await alertGroupRepository.findByIds([
			'662e469a5213ce0cd9b5c473',
			'662e46a16d91b65f5cfe6cbb',
		]);

		expect(result[0]).toBeInstanceOf(AlertGroupEntity);
		expect(result[0].id).toBe('662e469a5213ce0cd9b5c473');
		expect(result[0].name).toBe('alertGroup1');
		expect(result[1]).toBeInstanceOf(AlertGroupEntity);
		expect(result[1].id).toBe('662e46a16d91b65f5cfe6cbb');
		expect(result[1].name).toBe('alertGroup2');
	});

	it('should update current units', async () => {
		const orgId = 'orgId';
		const alertGroupId = 'alertGroupId';
		const unitIds = ['unitId1', 'unitId2'];

		mockAlertGroupModel.updateOne.mockResolvedValueOnce({
			modifiedCount: 1,
		} as any);

		await expect(
			alertGroupRepository.updateCurrentUnits(orgId, alertGroupId, unitIds),
		).resolves.toBeTruthy();
		expect(mockAlertGroupModel.updateOne).toHaveBeenCalledWith(
			{ _id: alertGroupId, orgId },
			{ $set: { currentUnits: unitIds } },
		);
	});

	it('should reset current units to default units', async () => {
		const orgId = 'orgId';

		await alertGroupRepository.resetCurrentUnitsToDefaultUnits(orgId);

		expect(mockAlertGroupModel.updateMany).toHaveBeenCalledWith({ orgId }, [
			{ $set: { currentUnits: '$defaultUnits' } },
		]);
	});
});
