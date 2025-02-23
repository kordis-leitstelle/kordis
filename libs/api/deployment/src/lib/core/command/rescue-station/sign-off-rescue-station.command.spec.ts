import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { uowMockProvider } from '@kordis/api/test-helpers';

import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../../repository/deployment-assignment.repository';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../../repository/rescue-station-deployment.repository';
import {
	SignOffRescueStationCommand,
	SignOffRescueStationHandler,
} from './sign-off-rescue-station.command';

describe('SignOffRescueStationHandler', () => {
	let handler: SignOffRescueStationHandler;
	const mockRescueStationDeploymentRepository =
		createMock<RescueStationDeploymentRepository>();
	const mockDeploymentAssignmentRepository =
		createMock<DeploymentAssignmentRepository>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SignOffRescueStationHandler,
				{
					provide: RESCUE_STATION_DEPLOYMENT_REPOSITORY,
					useValue: mockRescueStationDeploymentRepository,
				},
				{
					provide: DEPLOYMENT_ASSIGNMENT_REPOSITORY,
					useValue: mockDeploymentAssignmentRepository,
				},
				uowMockProvider(),
			],
		}).compile();

		handler = module.get<SignOffRescueStationHandler>(
			SignOffRescueStationHandler,
		);
	});

	it('should call specific methods when command is executed', async () => {
		const orgId = 'orgId';
		const rescueStationId = 'rescueStationId';
		const command = new SignOffRescueStationCommand(orgId, rescueStationId);
		await handler.execute(command);

		expect(
			mockDeploymentAssignmentRepository.removeAssignmentsOfDeployment,
		).toHaveBeenCalledWith(orgId, rescueStationId, expect.anything());
		expect(
			mockRescueStationDeploymentRepository.updateOne,
		).toHaveBeenCalledWith(
			orgId,
			rescueStationId,
			{
				signedIn: false,
				note: '',
				strength: {
					helpers: 0,
					leaders: 0,
					subLeaders: 0,
				},
			},
			expect.anything(),
		);
	});
});
