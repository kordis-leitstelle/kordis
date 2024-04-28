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

import { UnitEntity, UnitStatus } from '../../core/entity/unit.entity';
import { UnitNotFoundException } from '../../core/exception/unit-not-found.exception';
import { UnitProfile } from '../mapper/unit.mapper-profile';
import { UnitDocument } from '../schema/unit.schema';
import { UnitRepositoryImpl } from './unit.repository';

describe('UnitRepositoryImpl', () => {
	let unitRepository: UnitRepositoryImpl;
	let mockUnitModel: jest.Mocked<Model<UnitDocument>>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				UnitRepositoryImpl,
				BaseModelProfile,
				UnitProfile,
				{
					provide: getModelToken(UnitDocument.name),
					useValue: createMock<UnitDocument>(),
				},
			],
		}).compile();

		unitRepository = moduleRef.get<UnitRepositoryImpl>(UnitRepositoryImpl);
		mockUnitModel = moduleRef.get<jest.Mocked<Model<UnitDocument>>>(
			getModelToken(UnitDocument.name),
		);
	});

	it('should find units by ids', async () => {
		mockModelMethodResults(
			mockUnitModel,
			[
				{
					_id: new Types.ObjectId('662e469a5213ce0cd9b5c473'),
					name: 'unit1',
				},
				{
					_id: new Types.ObjectId('662e46a16d91b65f5cfe6cbb'),
					name: 'unit2',
				},
			],
			'find',
		);

		const result = await unitRepository.findByIds([
			'662e469a5213ce0cd9b5c473',
			'662e46a16d91b65f5cfe6cbb',
		]);

		expect(result[0]).toBeInstanceOf(UnitEntity);
		expect(result[0].id).toBe('662e469a5213ce0cd9b5c473');
		expect(result[0].name).toBe('unit1');
		expect(result[1]).toBeInstanceOf(UnitEntity);
		expect(result[1].id).toBe('662e46a16d91b65f5cfe6cbb');
		expect(result[1].name).toBe('unit2');
	});

	describe('findById', () => {
		it('should find unit by id', async () => {
			mockModelMethodResult(
				mockUnitModel,
				{
					_id: new Types.ObjectId('662e469a5213ce0cd9b5c473'),
					name: 'unit1',
				},
				'findOne',
			);

			const result = await unitRepository.findById('orgId', 'id');

			expect(result).toBeInstanceOf(UnitEntity);
			expect(result.id).toBe('662e469a5213ce0cd9b5c473');
			expect(result.name).toBe('unit1');
		});

		it('should throw UnitNotFoundException if unit is not found', async () => {
			mockModelMethodResult(mockUnitModel, null, 'findOne');
			await expect(unitRepository.findById('orgId', 'id')).rejects.toThrow(
				UnitNotFoundException,
			);
		});
	});

	it('should find units by organization id', async () => {
		mockModelMethodResults(
			mockUnitModel,
			[
				{
					_id: new Types.ObjectId('662e469a5213ce0cd9b5c473'),
					name: 'unit1',
				},
				{
					_id: new Types.ObjectId('662e46a16d91b65f5cfe6cbb'),
					name: 'unit2',
				},
			],
			'find',
		);

		const result = await unitRepository.findByOrg('orgId');

		expect(result[0]).toBeInstanceOf(UnitEntity);
		expect(result[0].id).toBe('662e469a5213ce0cd9b5c473');
		expect(result[0].name).toBe('unit1');
		expect(result[1]).toBeInstanceOf(UnitEntity);
		expect(result[1].id).toBe('662e46a16d91b65f5cfe6cbb');
		expect(result[1].name).toBe('unit2');
	});

	describe('findByRcsId', () => {
		it('should find unit by RCS id', async () => {
			mockModelMethodResult(
				mockUnitModel,
				{
					_id: new Types.ObjectId('662e469a5213ce0cd9b5c473'),
					name: 'unit1',
				},
				'findOne',
			);

			const result = await unitRepository.findByRcsId('orgId', 'rcsId');

			expect(result).toBeInstanceOf(UnitEntity);
			expect(result.id).toBe('662e469a5213ce0cd9b5c473');
			expect(result.name).toBe('unit1');
		});

		it('should throw UnitNotFoundException if unit is not found', async () => {
			mockModelMethodResult(mockUnitModel, null, 'findOne');
			await expect(
				unitRepository.findByRcsId('orgId', 'rcsId'),
			).rejects.toThrow(UnitNotFoundException);
		});
	});

	describe('updateNote', () => {
		it('should call the updateNote method correctly', async () => {
			const orgId = 'orgId';
			const id = 'id';
			const note = 'note';

			await unitRepository.updateNote(orgId, id, note);

			expect(mockUnitModel.updateOne).toHaveBeenCalledWith(
				{ _id: id, orgId },
				{ $set: { note } },
			);
		});

		it('should return true if modifiedCount is greater than 0', async () => {
			mockUnitModel.updateOne.mockResolvedValueOnce({
				modifiedCount: 1,
			} as any);

			const result = await unitRepository.updateNote('orgId', 'id', 'note');

			expect(result).toBe(true);
		});

		it('should return false if modifiedCount is 0', async () => {
			mockUnitModel.updateOne.mockResolvedValueOnce({
				modifiedCount: 0,
			} as any);

			const result = await unitRepository.updateNote('orgId', 'id', 'note');

			expect(result).toBe(false);
		});
	});

	describe('updateStatus', () => {
		it('should call the updateStatus method correctly', async () => {
			const status = new UnitStatus();
			status.receivedAt = new Date();
			status.source = 'someSource';
			status.status = 1;

			await unitRepository.updateStatus('orgId', 'id', status);

			expect(mockUnitModel.updateOne).toHaveBeenCalledWith(
				{
					_id: 'id',
					orgId: 'orgId',
					'status.receivedAt': { $lt: status.receivedAt },
				},
				{ $set: { status } },
			);
		});

		it('should return true if modifiedCount is greater than 0', async () => {
			const status = new UnitStatus();
			status.receivedAt = new Date();
			status.source = 'someSource';
			status.status = 1;
			mockUnitModel.updateOne.mockResolvedValueOnce({
				modifiedCount: 1,
			} as any);

			const result = await unitRepository.updateStatus('orgId', 'id', status);

			expect(result).toBe(true);
		});

		it('should return false if modifiedCount is 0', async () => {
			const status = new UnitStatus();
			status.receivedAt = new Date();
			status.source = 'someSource';
			status.status = 1;

			mockUnitModel.updateOne.mockResolvedValueOnce({
				modifiedCount: 0,
			} as any);

			const result = await unitRepository.updateStatus('orgId', 'id', status);

			expect(result).toBe(false);
		});
	});
});
