import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { OperationDeploymentEntity } from '../entity/operation-deplyoment.entity';
import { RescueStationDeploymentEntity } from '../entity/rescue-station-deployment.entity';
import { UnitsAssignedToOperationException } from '../exception/units-assigned-to-operation.exception';
import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../repository/deployment-assignment.repository';
import {
	UNIT_ASSIGNMENT_REPOSITORY,
	UnitAssignmentRepository,
} from '../repository/unit-assignment.repository';
import { DeploymentAssignmentService } from './deployment-assignment.service';

describe('DeploymentAssignmentService', () => {
	let service: DeploymentAssignmentService;
	const mockDeploymentAssignmentRepository =
		createMock<DeploymentAssignmentRepository>();
	const mockUnitAssignmentRepository = createMock<UnitAssignmentRepository>();

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DeploymentAssignmentService,
				{
					provide: DEPLOYMENT_ASSIGNMENT_REPOSITORY,
					useValue: mockDeploymentAssignmentRepository,
				},
				{
					provide: UNIT_ASSIGNMENT_REPOSITORY,
					useValue: mockUnitAssignmentRepository,
				},
			],
		}).compile();

		service = module.get<DeploymentAssignmentService>(
			DeploymentAssignmentService,
		);
	});

	it('should set assignments of a deployment', async () => {
		const orgId = 'orgId';
		const deploymentId = 'deploymentId';
		const unitIds = ['unitId1', 'unitId2'];
		const alertGroups = [
			{ alertGroupId: 'alertGroupId1', unitIds: ['unitId3', 'unitId4'] },
			{ alertGroupId: 'alertGroupId2', unitIds: ['unitId5', 'unitId6'] },
		];

		await service.setAssignmentsOfDeployment(
			orgId,
			deploymentId,
			unitIds,
			alertGroups,
		);

		expect(
			mockDeploymentAssignmentRepository.removeAssignmentsOfDeployment,
		).toHaveBeenCalledWith(orgId, deploymentId, undefined);
		expect(
			mockUnitAssignmentRepository.removeAssignmentsFromAlertGroups,
		).toHaveBeenCalledWith(
			orgId,
			['alertGroupId1', 'alertGroupId2'],
			undefined,
		);
		expect(
			mockUnitAssignmentRepository.removeAlertGroupFromUnits,
		).toHaveBeenCalledWith(
			orgId,
			['unitId3', 'unitId4', 'unitId5', 'unitId6', 'unitId1', 'unitId2'],
			undefined,
		);
		expect(
			mockUnitAssignmentRepository.setAlertGroupAssignment,
		).toHaveBeenCalledTimes(2);
		expect(
			mockDeploymentAssignmentRepository.assignEntitiesToDeployment,
		).toHaveBeenCalledWith(
			orgId,
			deploymentId,
			[
				'unitId1',
				'unitId2',
				'unitId3',
				'unitId4',
				'unitId5',
				'unitId6',
				'alertGroupId1',
				'alertGroupId2',
			],
			undefined,
		);
	});

	it('should remove assignments of deployment', async () => {
		const orgId = 'orgId';
		const deploymentId = 'deploymentId';

		await service.removeAssignmentsOfDeployment(orgId, deploymentId);

		expect(
			mockDeploymentAssignmentRepository.removeAssignmentsOfDeployment,
		).toHaveBeenCalledWith(orgId, deploymentId, undefined);
	});

	describe('assertNoActiveOperationAssignment', () => {
		it('should pass when no units are assigned to an operation', async () => {
			const orgId = 'orgId';
			const unitIds = ['unitId1', 'unitId2'];

			mockDeploymentAssignmentRepository.getAssignments.mockResolvedValue({
				unitId1: { name: 'RW 1' } as RescueStationDeploymentEntity,
				unitId2: { name: 'RW 2' } as RescueStationDeploymentEntity,
			});

			await expect(
				service.assertNoActiveOperationAssignment(unitIds, orgId),
			).resolves.not.toThrow();
		});

		it('should throw UnitsAssignedToOperationException when units are assigned to an operation', async () => {
			const orgId = 'orgId';
			const unitIds = ['unitId1', 'unitId2'];
			const operationDeployment = new OperationDeploymentEntity();
			operationDeployment.operation = { id: 'opId' } as any;

			mockDeploymentAssignmentRepository.getAssignments.mockResolvedValueOnce({
				unitId1: null,
				unitId2: operationDeployment,
			});

			await expect(
				service.assertNoActiveOperationAssignment(unitIds, orgId),
			).rejects.toThrow(UnitsAssignedToOperationException);
		});
	});
});
