import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { RescueStationDeploymentEntity } from '../entity/rescue-station-deployment.entity';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../repository/rescue-station-deployment.repository';
import {
	GetRescueStationDeploymentHandler,
	GetRescueStationDeploymentQuery,
} from './get-rescue-station-deployment.query';

describe('GetRescueStationDeploymentHandler', () => {
	let handler: GetRescueStationDeploymentHandler;
	const mockRescueStationDeploymentRepository =
		createMock<RescueStationDeploymentRepository>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetRescueStationDeploymentHandler,
				{
					provide: RESCUE_STATION_DEPLOYMENT_REPOSITORY,
					useValue: mockRescueStationDeploymentRepository,
				},
			],
		}).compile();

		handler = module.get<GetRescueStationDeploymentHandler>(
			GetRescueStationDeploymentHandler,
		);
	});

	it('should find rescue station deployment by orgId and id', async () => {
		const orgId = 'orgId';
		const id = 'id';
		const command = new GetRescueStationDeploymentQuery(orgId, id);

		const mockDeployment = new RescueStationDeploymentEntity();
		mockDeployment.note = 'somenote';
		mockRescueStationDeploymentRepository.findById.mockResolvedValue(
			mockDeployment,
		);

		const result = await handler.execute(command);

		expect(mockRescueStationDeploymentRepository.findById).toHaveBeenCalledWith(
			orgId,
			id,
		);
		expect(result).toEqual(mockDeployment);
	});
});
