import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import {
	UNIT_ASSIGNMENT_REPOSITORY,
	UnitAssignmentRepository,
} from '../repository/unit-assignment.repository';
import {
	GetAlertGroupAssignedUnitsHandler,
	GetAlertGroupAssignedUnitsQuery,
} from './get-alert-group-assigned-units.query';

describe('GetAlertGroupAssignedUnitsHandler', () => {
	let handler: GetAlertGroupAssignedUnitsHandler;
	const mockUnitAssignmentRepository = createMock<UnitAssignmentRepository>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetAlertGroupAssignedUnitsHandler,
				{
					provide: UNIT_ASSIGNMENT_REPOSITORY,
					useValue: mockUnitAssignmentRepository,
				},
			],
		}).compile();

		handler = module.get<GetAlertGroupAssignedUnitsHandler>(
			GetAlertGroupAssignedUnitsHandler,
		);
	});

	it('should get assigned units of alert group', async () => {
		const orgId = 'orgId';
		const alertGroupId = 'alertGroupId';
		const query = new GetAlertGroupAssignedUnitsQuery(orgId, alertGroupId);
		await handler.execute(query);

		expect(
			mockUnitAssignmentRepository.getUnitsOfAlertGroup,
		).toHaveBeenCalledWith(orgId, alertGroupId);
	});
});
