import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import {
	mockModelMethodResult,
	mockModelMethodResults,
} from '@kordis/api/test-helpers';

import { OperationInvolvementDocument } from '../schema/operation-involvement.schema';
import { OperationInvolvementsRepositoryImpl } from './operation-involvements.repository';

describe('OperationInvolvementsRepositoryImpl', () => {
	let repository: OperationInvolvementsRepositoryImpl;
	let mockModel: jest.Mocked<Model<OperationInvolvementDocument>>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				OperationInvolvementsRepositoryImpl,
				{
					provide: getModelToken(OperationInvolvementDocument.name),
					useValue: createMock<Model<OperationInvolvementDocument>>(),
				},
			],
		}).compile();

		repository = moduleRef.get<OperationInvolvementsRepositoryImpl>(
			OperationInvolvementsRepositoryImpl,
		);
		mockModel = moduleRef.get<jest.Mocked<Model<OperationInvolvementDocument>>>(
			getModelToken(OperationInvolvementDocument.name),
		);
	});

	it('should find operation involvement', async () => {
		const orgId = 'org1';
		const operationId = '67af349ae5b393f66fc51851';
		const unitId = 'unit1';
		const alertGroupId = 'alert1';

		const mockInvolvement = {
			orgId,
			operation: new Types.ObjectId(operationId),
			unitId,
			alertGroupId,
			involvementTimes: [{ start: new Date(), end: null }],
			isPending: false,
		};

		mockModelMethodResult(mockModel, mockInvolvement, 'findOne');

		const result = await repository.findOperationInvolvement(
			orgId,
			operationId,
			unitId,
			alertGroupId,
		);
		expect(result).toEqual({
			unitId,
			operationId,
			involvementTimes: mockInvolvement.involvementTimes,
			alertGroupId,
			isPending: false,
		});
	});

	it('should find ongoing involvements for an operation', async () => {
		const orgId = 'org1';
		const operationId = '67af349ae5b393f66fc51851';

		const mockInvolvements = [
			{
				orgId,
				operation: new Types.ObjectId(operationId),
				unitId: 'unit1',
				alertGroupId: 'alert1',
				involvementTimes: [{ start: new Date(), end: null }],
				isPending: false,
				isDeleted: false,
			},
			{
				orgId,
				operation: new Types.ObjectId(operationId),
				unitId: 'unit2',
				alertGroupId: null,
				involvementTimes: [],
				isPending: true,
				isDeleted: false,
			},
		];

		mockModelMethodResults(mockModel, mockInvolvements, 'find');

		const result = await repository.findOperationOngoingInvolvements(
			orgId,
			operationId,
		);

		expect(mockModel.find).toHaveBeenCalledWith({
			orgId,
			operation: new Types.ObjectId(operationId),
			$or: [{ 'involvementTimes.end': null }, { isPending: true }],
			isDeleted: false,
		});

		expect(result).toEqual([
			{
				unitId: 'unit1',
				operationId,
				involvementTimes: mockInvolvements[0].involvementTimes,
				alertGroupId: 'alert1',
				isPending: false,
			},
			{
				unitId: 'unit2',
				operationId,
				involvementTimes: [],
				alertGroupId: null,
				isPending: true,
			},
		]);
	});

	it('should remove all pending involvements', async () => {
		const orgId = 'org1';
		const operationId = '67af349ae5b393f66fc51851';

		await repository.removeAllPending(orgId, operationId);

		expect(mockModel.deleteMany).toHaveBeenCalledWith({
			orgId,
			operation: new Types.ObjectId(operationId),
			isPending: true,
		});
	});

	it('should end all active involvements', async () => {
		const orgId = 'org1';
		const operationId = '67af349ae5b393f66fc51851';
		const end = new Date();

		await repository.setEndOfAllActive(orgId, operationId, end);

		expect(mockModel.updateMany).toHaveBeenCalledWith(
			{
				orgId,
				operation: new Types.ObjectId(operationId),
				'involvementTimes.end': null,
			},
			{
				$set: {
					'involvementTimes.$.end': end,
				},
			},
		);
	});

	it('should set pending state', async () => {
		const orgId = 'org1';
		const operationId = '67af349ae5b393f66fc51851';
		const unitId = 'unit1';
		const alertGroupId = 'alert1';
		const isPending = true;

		await repository.setPendingState(
			orgId,
			operationId,
			unitId,
			alertGroupId,
			isPending,
		);

		expect(mockModel.updateOne).toHaveBeenCalledWith(
			{
				orgId,
				operation: new Types.ObjectId(operationId),
				unitId,
				alertGroupId,
			},
			{ $set: { isPending } },
		);
	});

	it('should create involvements', async () => {
		const orgId = 'org1';
		const operationId = '67af349ae5b393f66fc51851';
		const involvements = [
			{
				orgId,
				unitId: 'unit1',
				operationId,
				alertGroupId: 'alert1',
				involvementTimes: [{ start: new Date(), end: null }],
				isPending: false,
			},
			{
				orgId,
				unitId: 'unit2',
				operationId,
				alertGroupId: null,
				involvementTimes: [{ start: new Date(), end: null }],
				isPending: true,
			},
		];

		await repository.createInvolvements(orgId, operationId, involvements);

		expect(mockModel.create).toHaveBeenCalledWith(
			involvements.map((dto) => ({
				orgId,
				operation: new Types.ObjectId(operationId),
				unitId: dto.unitId,
				involvementTimes: dto.involvementTimes,
				alertGroupId: dto.alertGroupId,
				isPending: dto.isPending,
			})),
			undefined,
		);
	});

	it("should set end date for a unit's involvement", async () => {
		const orgId = 'org1';
		const operationId = '67af349ae5b393f66fc51851';
		const unitId = 'unit1';
		const alertGroupId = 'alert1';
		const end = new Date();

		await repository.setEnd(orgId, operationId, unitId, alertGroupId, end);

		expect(mockModel.updateOne).toHaveBeenCalledWith(
			{
				orgId,
				operation: new Types.ObjectId(operationId),
				unitId,
				alertGroupId,
				'involvementTimes.end': null,
			},
			{
				$set: {
					'involvementTimes.$.end': end,
				},
			},
		);
	});

	it('should remove all involvements for a given operation', async () => {
		const orgId = 'org1';
		const operationId = '67af349ae5b393f66fc51851';

		await repository.removeInvolvements(orgId, operationId);

		expect(mockModel.deleteMany).toHaveBeenCalledWith({
			orgId,
			operation: new Types.ObjectId(operationId),
		});
	});

	it('should find unit involvement within a time range', async () => {
		const orgId = 'org1';
		const unitId = 'unit1';
		const start = new Date('2023-01-01');
		const end = new Date('2023-12-31');

		const mockInvolvement = {
			orgId,
			unitId,
			involvementTimes: [
				{ start: new Date('2023-01-01'), end: new Date('2023-12-31') },
			],
			alertGroupId: null,
			isPending: false,
			operation: new Types.ObjectId('67af349ae5b393f66fc51851'),
		};

		mockModelMethodResult(mockModel, mockInvolvement, 'findOne');

		const result = await repository.findByUnitInvolvementTimeRange(
			orgId,
			unitId,
			start,
			end,
		);

		expect(result).toEqual({
			unitId,
			operationId: '67af349ae5b393f66fc51851',
			involvementTimes: mockInvolvement.involvementTimes,
			alertGroupId: mockInvolvement.alertGroupId,
			isPending: mockInvolvement.isPending,
		});
	});

	it("should add start date to a pending unit's involvement", async () => {
		const orgId = 'org1';
		const operationId = '67af349ae5b393f66fc51851';
		const unitId = 'unit1';
		const start = new Date();

		await repository.addStartOfPendingUnit(orgId, operationId, unitId, start);

		expect(mockModel.updateOne).toHaveBeenCalledWith(
			{
				orgId,
				operation: new Types.ObjectId(operationId),
				unitId,
				isPending: true,
			},
			{
				$set: {
					isPending: false,
				},
				$push: {
					involvementTimes: { start, end: null },
				},
			},
		);
	});

	it('should set the deleted flag for all involvements of a given operation', async () => {
		const orgId = 'org1';
		const operationId = '67af349ae5b393f66fc51851';
		const deleted = true;

		await repository.setDeletedFlag(orgId, operationId, deleted);

		expect(mockModel.updateMany).toHaveBeenCalledWith(
			{
				orgId,
				operation: new Types.ObjectId(operationId),
			},
			{
				$set: {
					isDeleted: deleted,
				},
			},
			{ session: undefined },
		);
	});
});
