import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import {
	UNIT_ASSIGNMENT_REPOSITORY,
	UnitAssignmentRepository,
} from '../repository/unit-assignment.repository';
import {
	GetAlertGroupByUnitIdHandler,
	GetAlertGroupByUnitIdQuery,
} from './get-alert-group-by-unit-id.query';

describe('GetAlertGroupByUnitIdHandler', () => {
	let handler: GetAlertGroupByUnitIdHandler;
	const mockUnitAssignmentRepository = createMock<UnitAssignmentRepository>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetAlertGroupByUnitIdHandler,
				{
					provide: UNIT_ASSIGNMENT_REPOSITORY,
					useValue: mockUnitAssignmentRepository,
				},
			],
		}).compile();

		handler = module.get<GetAlertGroupByUnitIdHandler>(
			GetAlertGroupByUnitIdHandler,
		);
	});

	it('should get alert group of unit from repository', async () => {
		const orgId = 'orgId';
		const unitId = 'unitId';
		const command = new GetAlertGroupByUnitIdQuery(orgId, unitId);
		await handler.execute(command);

		expect(
			mockUnitAssignmentRepository.findAlertGroupOfUnit,
		).toHaveBeenCalledWith(orgId, unitId);
	});
});
