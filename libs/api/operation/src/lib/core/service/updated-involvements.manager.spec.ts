import { DeepMocked, createMock } from '@golevelup/ts-jest';

import { DbSessionProvider } from '@kordis/api/shared';

import { UpdateOngoingOperationInvolvementsCommand } from '../command/update-ongoing-operation-involvements.command';
import {
	OperationInvolvementsRepository,
	UnitInvolvement,
} from '../repository/operation-involvement.repository';
import { OperationInvolvementService } from './unit-involvement/operation-involvement.service';
import { UpdatedInvolvementsManager } from './updated-involvements.manager';

describe('UpdatedInvolvementsManager', () => {
	let manager: UpdatedInvolvementsManager;
	let mockInvolvementService: jest.Mocked<OperationInvolvementService>;
	let mockInvolvementsRepository: DeepMocked<OperationInvolvementsRepository>;
	let mockUow: DeepMocked<DbSessionProvider>;
	let command: UpdateOngoingOperationInvolvementsCommand;
	let endDate: Date;

	beforeEach(async () => {
		mockInvolvementService = createMock<OperationInvolvementService>();
		mockInvolvementsRepository = createMock<OperationInvolvementsRepository>();
		mockUow = createMock<DbSessionProvider>();
		endDate = new Date();

		command = new UpdateOngoingOperationInvolvementsCommand(
			'org1',
			'op1',
			['unit1', 'unit2', 'unit3'],
			[
				{
					alertGroupId: 'alertGroup1',
					assignedUnitIds: ['unit4', 'unit5'],
				},
			],
		);

		manager = new UpdatedInvolvementsManager(
			mockInvolvementService,
			mockInvolvementsRepository,
			command,
			endDate,
			mockUow,
		);
	});

	describe('initialize', () => {
		it('should load current involvements and prepare data structures', async () => {
			const currentInvolvements: UnitInvolvement[] = [
				{
					unitId: 'unit1',
					operationId: 'op1',
					alertGroupId: null,
					isPending: false,
					involvementTimes: [],
				},
				{
					unitId: 'unit4',
					operationId: 'op1',
					alertGroupId: 'alertGroup1',
					isPending: false,
					involvementTimes: [],
				},
			];

			mockInvolvementsRepository.findOperationOngoingInvolvements.mockResolvedValue(
				currentInvolvements,
			);

			await manager.initialize();

			expect(
				mockInvolvementsRepository.findOperationOngoingInvolvements,
			).toHaveBeenCalledWith('org1', 'op1', mockUow);
		});
	});

	describe('handleUnitInvolvements', () => {
		beforeEach(async () => {
			mockInvolvementsRepository.findOperationOngoingInvolvements.mockResolvedValue(
				[
					{
						unitId: 'unit1',
						operationId: 'op1',
						alertGroupId: null,
						isPending: false,
						involvementTimes: [],
					},
				],
			);

			await manager.initialize();
		});

		it('should add new units as pending', async () => {
			await manager.handleUnitInvolvements();

			// Should call involveUnitAsPending for unit2 and unit3 (new units)
			expect(mockInvolvementService.involveUnitAsPending).toHaveBeenCalledWith(
				'org1',
				'op1',
				'unit2',
				null,
				mockUow,
			);
			expect(mockInvolvementService.involveUnitAsPending).toHaveBeenCalledWith(
				'org1',
				'op1',
				'unit3',
				null,
				mockUow,
			);

			// Should not call involveUnitAsPending for unit1 (already involved)
			expect(
				mockInvolvementService.involveUnitAsPending,
			).not.toHaveBeenCalledWith('org1', 'op1', 'unit1', null, mockUow);
		});

		it('should handle removed units correctly', async () => {
			mockInvolvementsRepository.findOperationOngoingInvolvements.mockResolvedValue(
				[
					{
						unitId: 'unit1',
						operationId: 'op1',
						alertGroupId: null,
						isPending: false,
						involvementTimes: [],
					},
					{
						unitId: 'extraUnit1',
						operationId: 'op1',
						alertGroupId: null,
						isPending: false,
						involvementTimes: [],
					},
					{
						unitId: 'extraUnit2',
						operationId: 'op1',
						alertGroupId: null,
						isPending: true,
						involvementTimes: [],
					},
				],
			);

			await manager.initialize();

			await manager.handleUnitInvolvements();

			// Should call setEnd for extraUnit1 (removed, not pending)
			expect(mockInvolvementsRepository.setEnd).toHaveBeenCalledWith(
				'org1',
				'op1',
				'extraUnit1',
				null,
				endDate,
				mockUow,
			);

			// Should call removeInvolvement for extraUnit2 (removed, pending)
			expect(mockInvolvementsRepository.removeInvolvement).toHaveBeenCalledWith(
				'org1',
				'extraUnit2',
				null,
				'op1',
				mockUow,
			);
		});
	});

	describe('handleAlertGroupInvolvements', () => {
		beforeEach(async () => {
			mockInvolvementsRepository.findOperationOngoingInvolvements.mockResolvedValue(
				[
					{
						unitId: 'unit4',
						operationId: 'op1',
						alertGroupId: 'alertGroup1',
						isPending: false,
						involvementTimes: [],
					},
				],
			);

			await manager.initialize();
		});

		it('should add new units to alert groups as pending', async () => {
			await manager.handleAlertGroupInvolvements();

			// Should call involveUnitAsPending for unit5 (new unit in alert group)
			expect(mockInvolvementService.involveUnitAsPending).toHaveBeenCalledWith(
				'org1',
				'op1',
				'unit5',
				'alertGroup1',
				mockUow,
			);

			// Should not call involveUnitAsPending for unit4 (already involved)
			expect(
				mockInvolvementService.involveUnitAsPending,
			).not.toHaveBeenCalledWith(
				'org1',
				'op1',
				'unit4',
				'alertGroup1',
				mockUow,
			);
		});

		it('should handle removed units from alert groups correctly', async () => {
			mockInvolvementsRepository.findOperationOngoingInvolvements.mockResolvedValue(
				[
					{
						unitId: 'unit4',
						operationId: 'op1',
						alertGroupId: 'alertGroup1',
						isPending: false,
						involvementTimes: [],
					},
					{
						unitId: 'extraUnit3',
						operationId: 'op1',
						alertGroupId: 'alertGroup1',
						isPending: false,
						involvementTimes: [],
					},
					{
						unitId: 'extraUnit4',
						operationId: 'op1',
						alertGroupId: 'alertGroup1',
						isPending: true,
						involvementTimes: [],
					},
				],
			);

			await manager.initialize();

			await manager.handleAlertGroupInvolvements();

			// Should call setEnd for extraUnit3 (removed from alert group, not pending)
			expect(mockInvolvementsRepository.setEnd).toHaveBeenCalledWith(
				'org1',
				'op1',
				'extraUnit3',
				'alertGroup1',
				endDate,
				mockUow,
			);

			// Should call removeInvolvement for extraUnit4 (removed from alert group, pending)
			expect(mockInvolvementsRepository.removeInvolvement).toHaveBeenCalledWith(
				'org1',
				'extraUnit4',
				'alertGroup1',
				'op1',
				mockUow,
			);
		});

		it('should handle new alert groups', async () => {
			const commandWithNewAlertGroup =
				new UpdateOngoingOperationInvolvementsCommand(
					'org1',
					'op1',
					['unit1'],
					[
						{
							alertGroupId: 'alertGroup1',
							assignedUnitIds: ['unit4', 'unit5'],
						},
						{
							alertGroupId: 'newAlertGroup',
							assignedUnitIds: ['unit6', 'unit7'],
						},
					],
				);

			manager = new UpdatedInvolvementsManager(
				mockInvolvementService,
				mockInvolvementsRepository,
				commandWithNewAlertGroup,
				endDate,
				mockUow,
			);

			mockInvolvementsRepository.findOperationOngoingInvolvements.mockResolvedValue(
				[
					{
						unitId: 'unit4',
						operationId: 'op1',
						alertGroupId: 'alertGroup1',
						isPending: false,
						involvementTimes: [],
					},
				],
			);

			await manager.initialize();

			await manager.handleAlertGroupInvolvements();

			expect(mockInvolvementService.involveUnitAsPending).toHaveBeenCalledWith(
				'org1',
				'op1',
				'unit6',
				'newAlertGroup',
				mockUow,
			);
			expect(mockInvolvementService.involveUnitAsPending).toHaveBeenCalledWith(
				'org1',
				'op1',
				'unit7',
				'newAlertGroup',
				mockUow,
			);
		});
	});

	describe('removeUnit', () => {
		it('should remove pending involvements', async () => {
			await (manager as any).removeUnit('unit1', null, true);

			expect(mockInvolvementsRepository.removeInvolvement).toHaveBeenCalledWith(
				'org1',
				'unit1',
				null,
				'op1',
				mockUow,
			);
			expect(mockInvolvementsRepository.setEnd).not.toHaveBeenCalled();
		});

		it('should set end date for non-pending involvements', async () => {
			await (manager as any).removeUnit('unit1', null, false);

			expect(mockInvolvementsRepository.setEnd).toHaveBeenCalledWith(
				'org1',
				'op1',
				'unit1',
				null,
				endDate,
				mockUow,
			);
			expect(
				mockInvolvementsRepository.removeInvolvement,
			).not.toHaveBeenCalled();
		});

		it('should handle alert group involvements correctly', async () => {
			await (manager as any).removeUnit('unit4', 'alertGroup1', true);

			expect(mockInvolvementsRepository.removeInvolvement).toHaveBeenCalledWith(
				'org1',
				'unit4',
				'alertGroup1',
				'op1',
				mockUow,
			);
		});
	});
});
