import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { ValidationException } from '@kordis/api/shared';
import { uowMockProvider } from '@kordis/api/test-helpers';

import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../repository/rescue-station-deployment.repository';
import { DeploymentAssignmentService } from '../service/deployment-assignment.service';
import { StrengthFromCommandFactory } from '../service/strength-from-command.factory';
import {
	SignInRescueStationCommand,
	SignInRescueStationHandler,
} from './sign-in-rescue-station.command';

describe('SignInRescueStationHandler', () => {
	let handler: SignInRescueStationHandler;
	const mockRescueStationDeploymentRepository =
		createMock<RescueStationDeploymentRepository>();
	const mockDeploymentAssignmentService =
		createMock<DeploymentAssignmentService>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SignInRescueStationHandler,
				StrengthFromCommandFactory,
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

		handler = module.get<SignInRescueStationHandler>(
			SignInRescueStationHandler,
		);
	});

	it('should call assignment and update', async () => {
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
		const command = new SignInRescueStationCommand(
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
		expect(mockRescueStationDeploymentRepository.updateOne).toHaveBeenCalled();
	});

	it('should throw validation exception when strength is invalid', async () => {
		const command = new SignInRescueStationCommand(
			'orgId',
			'rescueStationId',
			{
				leaders: -1,
				subLeaders: 1,
				helpers: 1,
			},
			'note',
			['unitId'],
			[{ alertGroupId: 'alertGroupId', unitIds: ['unitId'] }],
		);

		await expect(handler.execute(command)).rejects.toThrow(ValidationException);
	});
});
