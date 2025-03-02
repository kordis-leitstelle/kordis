import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { uowMockProvider } from '@kordis/api/test-helpers';

import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../../repository/rescue-station-deployment.repository';
import { DeploymentAssignmentService } from '../../service/deployment-assignment.service';
import {
	UpdateSignedInRescueStationCommand,
	UpdateSignedInRescueStationHandler,
} from './update-signed-in-rescue-station.command';

describe('UpdateSignedInRescueStationHandler', () => {
	let handler: UpdateSignedInRescueStationHandler;
	const mockRescueStationDeploymentRepository =
		createMock<RescueStationDeploymentRepository>();
	const mockDeploymentAssignmentService =
		createMock<DeploymentAssignmentService>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UpdateSignedInRescueStationHandler,
				{
					provide: RESCUE_STATION_DEPLOYMENT_REPOSITORY,
					useValue: mockRescueStationDeploymentRepository,
				},
				{
					provide: DeploymentAssignmentService,
					useValue: mockDeploymentAssignmentService,
				},
				uowMockProvider(),
			],
		}).compile();

		handler = module.get<UpdateSignedInRescueStationHandler>(
			UpdateSignedInRescueStationHandler,
		);
	});

	it('should call specific methods when command is executed', async () => {
		const orgId = 'orgId';
		const rescueStationId = 'rescueStationId';
		const strength = {
			leaders: 1,
			subLeaders: 1,
			helpers: 1,
		};
		const note = 'note';
		const assignedUnitIds = ['unitId'];
		const assignedAlertGroups = [
			{ alertGroupId: 'alertGroupId', unitIds: ['unitId'] },
		];
		const command = new UpdateSignedInRescueStationCommand(
			orgId,
			rescueStationId,
			strength,
			note,
			assignedUnitIds,
			assignedAlertGroups,
		);
		await handler.execute(command);

		expect(
			mockDeploymentAssignmentService.setAssignmentsOfDeployment,
		).toHaveBeenCalledWith(
			orgId,
			rescueStationId,
			assignedUnitIds,
			assignedAlertGroups,
			expect.anything(),
		);

		expect(
			mockRescueStationDeploymentRepository.updateOne,
		).toHaveBeenCalledWith(
			orgId,
			rescueStationId,
			{
				note,
				strength,
			},
			expect.anything(),
		);
	});
});
