import { createMock } from '@golevelup/ts-jest';
import { CommandBus, EventBus } from '@nestjs/cqrs';

import { CreateAlertForOperationCommand } from '@kordis/api/alerting';
import {
	CreateOperationCommand,
	OperationCreatedEvent,
	OperationViewModel,
} from '@kordis/api/operation';
import {
	CreateOperationStartedMessageCommand,
	TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import { UnitsPopulateService } from '../service/units-populate.service';
import {
	LaunchCreateOngoingOperationProcessCommand,
	LaunchCreateOngoingOperationProcessHandler,
} from './launch-create-ongoing-operation-process.command';

const OPERATION_ARGS = Object.freeze({
	start: new Date(),
	alarmKeyword: 'THWAY',
	location: {
		address: {
			name: 'somewhere',
			street: '',
			postalCode: '',
			city: '',
		},
		coordinate: null,
	},
	assignedUnitIds: ['unitId1', 'unitId2'],
	assignedAlertGroups: [
		{
			alertGroupId: 'alertGroupId',
			assignedUnitIds: ['unitId3', 'unitId4'],
		},
	],
});

const OPERATION = Object.freeze({
	id: 'operationId',
	sign: 'sign',
	start: OPERATION_ARGS.start,
	alarmKeyword: OPERATION_ARGS.alarmKeyword,
	location: OPERATION_ARGS.location,
} as OperationViewModel);

describe('LaunchCreateOngoingOperationProcessHandler', () => {
	let handler: LaunchCreateOngoingOperationProcessHandler;
	let commandBusMock: jest.Mocked<CommandBus>;
	let eventBusMock: jest.Mocked<EventBus>;
	let unitsPopulateServiceMock: jest.Mocked<UnitsPopulateService>;

	beforeEach(() => {
		commandBusMock = createMock<CommandBus>();
		eventBusMock = createMock<EventBus>();
		unitsPopulateServiceMock = createMock<UnitsPopulateService>();

		handler = new LaunchCreateOngoingOperationProcessHandler(
			commandBusMock,
			unitsPopulateServiceMock,
			eventBusMock,
		);
	});

	it('should execute CreateOperationCommand and CreateOperationStartedMessageCommand', async () => {
		const requestUser: AuthUser = { organizationId: 'orgId' } as AuthUser;
		const command = new LaunchCreateOngoingOperationProcessCommand(
			requestUser,
			OPERATION_ARGS,
			TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
			null,
		);

		commandBusMock.execute.mockResolvedValueOnce(OPERATION);

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

		const result = await handler.execute(command);

		expect(result).toEqual(OPERATION);
		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new CreateOperationCommand(
				requestUser,
				OPERATION_ARGS.start,
				null,
				OPERATION_ARGS.location,
				OPERATION_ARGS.alarmKeyword,
				OPERATION_ARGS.assignedUnitIds,
				OPERATION_ARGS.assignedAlertGroups,
			),
		);
		expect(eventBusMock.publish).toHaveBeenCalledWith(
			new OperationCreatedEvent(requestUser.organizationId, OPERATION),
		);
		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new CreateOperationStartedMessageCommand(
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.sender,
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.recipient,
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.channel,
				{
					id: OPERATION.id,
					sign: OPERATION.sign,
					alarmKeyword: OPERATION.alarmKeyword,
					start: OPERATION.start,
					location: OPERATION.location.address,
					assignedUnits: mockAssignedUnits,
					assignedAlertGroups: mockAssignedAlertGroups,
				},
				requestUser,
			),
		);
	});

	it('should execute CreateAlertForOperationCommand if alertData is provided', async () => {
		const requestUser: AuthUser = { organizationId: 'orgId' } as AuthUser;

		const alertData = {
			alertGroupIds: ['alertGroupId1', 'alertGroupId2'],
			description: 'Test alert description',
			hasPriority: true,
		};

		const command = new LaunchCreateOngoingOperationProcessCommand(
			requestUser,
			OPERATION_ARGS,
			TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
			alertData,
		);

		commandBusMock.execute.mockResolvedValueOnce(OPERATION);

		await handler.execute(command);

		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new CreateAlertForOperationCommand(
				alertData.alertGroupIds,
				alertData.description,
				OPERATION,
				alertData.hasPriority,
				requestUser.organizationId,
			),
		);
	});
});
