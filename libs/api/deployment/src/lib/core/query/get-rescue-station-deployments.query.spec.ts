import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { RescueStationDeploymentEntity } from '../entity/rescue-station-deployment.entity';
import {
	RESCUE_STATION_DEPLOYMENT_REPOSITORY,
	RescueStationDeploymentRepository,
} from '../repository/rescue-station-deployment.repository';
import {
	GetRescueStationDeploymentsQuery,
	GetRescueStationsDeploymentsHandler,
} from './get-rescue-station-deployments.query';

describe('GetDeploymentsHandler', () => {
	let handler: GetRescueStationsDeploymentsHandler;
	const mockRescueStationDeploymentRepository =
		createMock<RescueStationDeploymentRepository>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetRescueStationsDeploymentsHandler,
				{
					provide: RESCUE_STATION_DEPLOYMENT_REPOSITORY,
					useValue: mockRescueStationDeploymentRepository,
				},
			],
		}).compile();

		handler = module.get<GetRescueStationsDeploymentsHandler>(
			GetRescueStationsDeploymentsHandler,
		);
	});

	it('should find rescue stations by orgId', async () => {
		const orgId = 'orgId';
		const command = new GetRescueStationDeploymentsQuery(orgId);

		const mockDeployment1 = new RescueStationDeploymentEntity();
		mockDeployment1.note = 'somenote';
		const mockDeployment2 = new RescueStationDeploymentEntity();
		mockDeployment2.note = 'someothernote';

		mockRescueStationDeploymentRepository.findByOrgId.mockResolvedValue([
			mockDeployment1,
			mockDeployment2,
		]);

		const result = await handler.execute(command);

		expect(
			mockRescueStationDeploymentRepository.findByOrgId,
		).toHaveBeenCalledWith(orgId, undefined);
		expect(result).toEqual([mockDeployment1, mockDeployment2]);
	});
});
