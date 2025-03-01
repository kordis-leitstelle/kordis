import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { DbSessionProvider } from '@kordis/api/shared';

import { UnitAlreadyInvolvedException } from '../../exceptions/unit-already-involved.exception';
import {
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../../repository/operation-involvement.repository';
import { OperationInvolvementService } from './operation-involvement.service';
import {
	SetAlertGroupInvolvementDto,
	SetUnitInvolvementDto,
} from './unit-involvement.dto';

describe('OperationInvolvementService', () => {
	let service: OperationInvolvementService;
	let mockInvolvementsRepository: jest.Mocked<OperationInvolvementsRepository>;

	beforeEach(async () => {
		mockInvolvementsRepository = createMock<OperationInvolvementsRepository>();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OperationInvolvementService,
				{
					provide: OPERATION_INVOLVEMENT_REPOSITORY,
					useValue: mockInvolvementsRepository,
				},
			],
		}).compile();

		service = module.get<OperationInvolvementService>(
			OperationInvolvementService,
		);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should set unit involvements', async () => {
		const orgId = 'org1';
		const operationId = 'op1';
		const unitInvolvements: SetUnitInvolvementDto[] = [
			{
				unitId: 'unit1',
				involvementTimes: [{ start: new Date(), end: null }],
				isPending: false,
			},
		];
		const alertGroupInvolvements: SetAlertGroupInvolvementDto[] = [];

		mockInvolvementsRepository.removeInvolvements.mockResolvedValue(undefined);
		mockInvolvementsRepository.createInvolvements.mockResolvedValue(undefined);
		mockInvolvementsRepository.findByUnitInvolvementTimeRange.mockResolvedValue(
			undefined,
		);
		mockInvolvementsRepository.findInvolvementOfPendingUnit.mockResolvedValue(
			undefined,
		);

		await service.setUnitInvolvements(
			orgId,
			operationId,
			unitInvolvements,
			alertGroupInvolvements,
			{} as DbSessionProvider,
		);

		expect(mockInvolvementsRepository.removeInvolvements).toHaveBeenCalledWith(
			orgId,
			operationId,
			expect.anything(),
		);
		expect(mockInvolvementsRepository.createInvolvements).toHaveBeenCalled();
	});

	it('should end active and pending involvements', async () => {
		const endDate = new Date();
		await service.endInvolvements(
			'org1',
			'op1',
			endDate,
			{} as DbSessionProvider,
		);

		expect(mockInvolvementsRepository.setEndOfAllActive).toHaveBeenCalledWith(
			'org1',
			'op1',
			endDate,
			expect.anything(),
		);
		expect(mockInvolvementsRepository.removeAllPending).toHaveBeenCalledWith(
			'org1',
			'op1',
			expect.anything(),
		);
	});

	it('should throw UnitAlreadyInvolvedException if unit is already involved as pending', async () => {
		const orgId = 'org1';
		const operationId = 'op1';
		const unitInvolvements: SetUnitInvolvementDto[] = [
			{
				unitId: 'unit1',
				involvementTimes: [{ start: new Date(), end: null }],
				isPending: false,
			},
		];
		const alertGroupInvolvements: SetAlertGroupInvolvementDto[] = [];

		mockInvolvementsRepository.findInvolvementOfPendingUnit.mockResolvedValue({
			operationId,
		} as any);

		await expect(
			service.setUnitInvolvements(
				orgId,
				operationId,
				unitInvolvements,
				alertGroupInvolvements,
				{} as DbSessionProvider,
			),
		).rejects.toThrow(UnitAlreadyInvolvedException);
	});

	it('should throw UnitAlreadyInvolvedException if unit is already involved with time', async () => {
		const orgId = 'org1';
		const operationId = 'op1';
		const unitInvolvements: SetUnitInvolvementDto[] = [
			{
				unitId: 'unit1',
				involvementTimes: [{ start: new Date(), end: null }],
				isPending: false,
			},
		];
		const alertGroupInvolvements: SetAlertGroupInvolvementDto[] = [];

		mockInvolvementsRepository.findInvolvementOfPendingUnit.mockResolvedValue(
			undefined,
		);
		mockInvolvementsRepository.findByUnitInvolvementTimeRange.mockResolvedValue(
			{
				operationId,
			} as any,
		);

		await expect(
			service.setUnitInvolvements(
				orgId,
				operationId,
				unitInvolvements,
				alertGroupInvolvements,
				{} as DbSessionProvider,
			),
		).rejects.toThrow(UnitAlreadyInvolvedException);
	});
});
