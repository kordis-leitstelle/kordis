import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { uowMockProvider } from '@kordis/api/test-helpers';

import {
	RescueStationDeploymentEntity,
	RescueStationStrength,
} from '../entity/rescue-station-deployment.entity';
import { RescueStationsResetEvent } from '../event/rescue-stations-reset.event';
import {
	DEPLOYMENT_ASSIGNMENT_REPOSITORY,
	DeploymentAssignmentRepository,
} from '../repository/deployment-assignment.repository';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../repository/rescue-station-deployment.repository';
import {
	ResetRescueStationsCommand,
	ResetRescueStationsHandler,
} from './reset-rescue-stations.command';

describe('ResetRescueStationsHandler', () => {
	let handler: ResetRescueStationsHandler;
	const mockRescueStationDeploymentRepository =
		createMock<RescueStationDeploymentRepository>();
	const mockDeploymentAssignmentRepository =
		createMock<DeploymentAssignmentRepository>();
	const mockEventBus = createMock<EventBus>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResetRescueStationsHandler,
				{
					provide: RESCUE_STATION_DEPLOYMENT_REPOSITORY,
					useValue: mockRescueStationDeploymentRepository,
				},
				{
					provide: DEPLOYMENT_ASSIGNMENT_REPOSITORY,
					useValue: mockDeploymentAssignmentRepository,
				},
				{
					provide: EventBus,
					useValue: mockEventBus,
				},
				uowMockProvider(),
			],
		}).compile();

		handler = module.get<ResetRescueStationsHandler>(
			ResetRescueStationsHandler,
		);
	});

	it('should reset rescue stations and publish event', async () => {
		const orgId = 'orgId';
		const rescueStations = [
			{ id: 'rescueStationId1' },
			{ id: 'rescueStationId2' },
		] as RescueStationDeploymentEntity[];
		mockRescueStationDeploymentRepository.findByOrgId.mockResolvedValue(
			rescueStations,
		);

		const command = new ResetRescueStationsCommand(orgId);
		await handler.execute(command);

		expect(
			mockRescueStationDeploymentRepository.findByOrgId,
		).toHaveBeenCalledWith(orgId, undefined, expect.anything());

		expect(
			mockDeploymentAssignmentRepository.removeAssignmentsOfDeployments,
		).toHaveBeenCalledWith(
			orgId,
			['rescueStationId1', 'rescueStationId2'],
			expect.anything(),
		);
		const expectedStrength = new RescueStationStrength();
		expectedStrength.leaders =
			expectedStrength.helpers =
			expectedStrength.subLeaders =
				0;

		expect(
			mockRescueStationDeploymentRepository.updateAll,
		).toHaveBeenCalledWith(
			orgId,
			{
				signedIn: false,
				note: '',
				strength: expectedStrength,
			},
			expect.anything(),
		);
		expect(mockEventBus.publish).toHaveBeenCalledWith(
			new RescueStationsResetEvent(orgId),
		);
	});
});
