import { createMock } from '@golevelup/ts-jest';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
	GetOperationByIdQuery,
	OperationViewModel,
	UpdateOngoingOperationInvolvementsCommand,
} from '@kordis/api/operation';
import { CreateOperationAssignmentsUpdatedMessageCommand } from '@kordis/api/protocol';
import { TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS } from '@kordis/api/test-helpers';
import { AuthUser } from '@kordis/shared/model';

import { UnitsPopulateService } from '../service/units-populate.service';
import {
	LaunchUpdateOngoingInvolvementsProcessCommand,
	LaunchUpdateOngoingInvolvementsProcessHandler,
} from './launch-update-ongoing-involvements-process.command';

describe('LaunchUpdateOngoingInvolvementsProcessHandler', () => {
	let handler: LaunchUpdateOngoingInvolvementsProcessHandler;
	let commandBusMock: jest.Mocked<CommandBus>;
	let queryBusMock: jest.Mocked<QueryBus>;
	let unitsPopulateServiceMock: jest.Mocked<UnitsPopulateService>;

	beforeEach(() => {
		commandBusMock = createMock<CommandBus>();
		queryBusMock = createMock<QueryBus>();
		unitsPopulateServiceMock = createMock<UnitsPopulateService>();

		handler = new LaunchUpdateOngoingInvolvementsProcessHandler(
			commandBusMock,
			queryBusMock,
			unitsPopulateServiceMock,
		);
	});

	it('should execute UpdateOngoingOperationInvolvementsCommand and CreateOperationAssignmentsUpdatedMessageCommand', async () => {
		const requestUser: AuthUser = { organizationId: 'orgId' } as AuthUser;
		const operationId = 'operationId';
		const assignments = {
			assignedUnitIds: ['unitId1', 'unitId2'],
			assignedAlertGroups: [
				{
					alertGroupId: 'alertGroupId',
					assignedUnitIds: ['unitId3', 'unitId4'],
				},
			],
		};

		const command = new LaunchUpdateOngoingInvolvementsProcessCommand(
			requestUser,
			operationId,
			assignments,
			TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
		);

		const operation = {
			id: operationId,
			sign: 'sign',
		} as OperationViewModel;
		queryBusMock.execute.mockResolvedValueOnce(operation);

		const mockAssignedUnits = [
			{ id: 'unitId1', name: 'Unit 1', callSign: 'U1' },
			{ id: 'unitId2', name: 'Unit 2', callSign: 'U2' },
		];
		const mockAssignedAlertGroups = [
			{
				id: 'alertGroupId',
				name: 'Alert Group 1',
				assignedUnits: [
					{ id: 'unitId3', name: 'Unit 3', callSign: 'U3' },
					{ id: 'unitId4', name: 'Unit 4', callSign: 'U4' },
				],
			},
		];
		unitsPopulateServiceMock.getPopulatedUnitsAndAlertGroups.mockResolvedValueOnce(
			{
				assignedUnits: mockAssignedUnits,
				assignedAlertGroups: mockAssignedAlertGroups,
			},
		);

		await handler.execute(command);

		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new UpdateOngoingOperationInvolvementsCommand(
				requestUser.organizationId,
				operationId,
				assignments.assignedUnitIds,
				assignments.assignedAlertGroups,
			),
		);
		expect(queryBusMock.execute).toHaveBeenCalledWith(
			new GetOperationByIdQuery(requestUser.organizationId, operationId),
		);
		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new CreateOperationAssignmentsUpdatedMessageCommand(
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.sender,
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.recipient,
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.channel,
				expect.any(Date),
				{
					operationId: operation.id,
					operationSign: operation.sign,
					assignedUnits: mockAssignedUnits,
					assignedAlertGroups: mockAssignedAlertGroups,
				},
				requestUser,
			),
		);
	});
});
