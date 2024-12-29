import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

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
});
