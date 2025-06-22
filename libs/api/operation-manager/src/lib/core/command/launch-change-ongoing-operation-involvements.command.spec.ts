import { createMock } from '@golevelup/ts-jest';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
	GetOperationByIdQuery,
	OperationViewModel,
	UpdateOngoingOperationInvolvementsCommand,
} from '@kordis/api/operation';
import {
	CreateOperationInvolvementsUpdatedMessageCommand,
	MessageUnit,
	TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { UnitsPopulateService } from '../service/units-populate.service';
import {
	LaunchChangeOngoingOperationInvolvementsCommand,
	LaunchChangeOngoingOperationInvolvementsHandler,
} from './launch-change-ongoing-operation-involvements.command';

describe('LaunchChangeOngoingOperationInvolvementsHandler', () => {
	let handler: LaunchChangeOngoingOperationInvolvementsHandler;
	let commandBusMock: jest.Mocked<CommandBus>;
	let queryBusMock: jest.Mocked<QueryBus>;
	let unitsPopulateServiceMock: jest.Mocked<UnitsPopulateService>;

	beforeEach(() => {
		commandBusMock = createMock<CommandBus>();
		queryBusMock = createMock<QueryBus>();
		unitsPopulateServiceMock = createMock<UnitsPopulateService>();

		handler = new LaunchChangeOngoingOperationInvolvementsHandler(
			commandBusMock,
			queryBusMock,
			unitsPopulateServiceMock,
		);
	});

	it('should execute UpdateOngoingOperationInvolvementsCommand and CreateOperationAssignmentsUpdatedMessageCommand', async () => {
		const orgId = 'orgId';
		const operationId = 'operationId';
		const reqUser: AuthUser = { organizationId: orgId } as AuthUser;

		const involvements: LaunchChangeOngoingOperationInvolvementsCommand['involvements'] =
			{
				assignedUnitIds: ['newUnitId1', 'newUnitId2'],
				assignedAlertGroups: [
					{
						alertGroupId: 'alertGroupId',
						assignedUnitIds: ['newUnitId3', 'newUnitId4'],
					},
				],
			};

		const protocolData = {
			sender: TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.sender as MessageUnit,
			recipient:
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.recipient as MessageUnit,
			channel: TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.channel,
		};

		const command = new LaunchChangeOngoingOperationInvolvementsCommand(
			orgId,
			operationId,
			involvements,
			protocolData,
			reqUser,
		);

		const operation: OperationViewModel = {
			id: operationId,
			sign: 'OP123',
			unitInvolvements: [
				{ unit: { id: 'unitId1' } },
				{ unit: { id: 'unitId2' } },
			],
			alertGroupInvolvements: [
				{
					alertGroup: { id: 'alertGroupId' },
					unitInvolvements: [
						{ unit: { id: 'unitId3' } },
						{ unit: { id: 'unitId4' } },
					],
				},
			],
		} as unknown as OperationViewModel;

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

		expect(queryBusMock.execute).toHaveBeenCalledWith(
			new GetOperationByIdQuery(orgId, operationId),
		);

		expect(
			unitsPopulateServiceMock.getPopulatedUnitsAndAlertGroups,
		).toHaveBeenCalledWith(
			['unitId1', 'unitId2'],
			[
				{
					alertGroupId: 'alertGroupId',
					assignedUnitIds: ['unitId3', 'unitId4'],
				},
			],
		);

		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new UpdateOngoingOperationInvolvementsCommand(
				orgId,
				operationId,
				involvements.assignedUnitIds,
				involvements.assignedAlertGroups,
			),
		);

		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new CreateOperationInvolvementsUpdatedMessageCommand(
				expect.any(Date),
				protocolData,
				{
					operationId: operation.id,
					operationSign: operation.sign,
					assignedUnits: mockAssignedUnits,
					assignedAlertGroups: mockAssignedAlertGroups,
				},
				reqUser,
			),
		);
	});
});
