import { createMock } from '@golevelup/ts-jest';
import { CommandBus, EventBus } from '@nestjs/cqrs';

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
	LaunchCreateOperationProcessCommand,
	LaunchCreateOperationProcessHandler,
} from './launch-create-operation-process.command';

describe('LaunchCreateOperationProcessHandler', () => {
	let handler: LaunchCreateOperationProcessHandler;
	let commandBusMock: jest.Mocked<CommandBus>;
	let eventBusMock: jest.Mocked<EventBus>;
	let unitsPopulateServiceMock: jest.Mocked<UnitsPopulateService>;

	beforeEach(() => {
		commandBusMock = createMock<CommandBus>();
		eventBusMock = createMock<EventBus>();
		unitsPopulateServiceMock = createMock<UnitsPopulateService>();

		handler = new LaunchCreateOperationProcessHandler(
			commandBusMock,
			unitsPopulateServiceMock,
			eventBusMock,
		);
	});

	it('should execute CreateOperationCommand and CreateOperationStartedMessageCommand', async () => {
		const requestUser: AuthUser = { organizationId: 'orgId' } as AuthUser;
		const operationArgs = {
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
		};

		const command = new LaunchCreateOperationProcessCommand(
			requestUser,
			operationArgs,
			TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
		);

		const operation = {
			id: 'operationId',
			sign: 'sign',
			start: operationArgs.start,
			alarmKeyword: operationArgs.alarmKeyword,
			location: operationArgs.location,
		} as OperationViewModel;
		commandBusMock.execute.mockResolvedValueOnce(operation);

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

		expect(result).toEqual(operation);
		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new CreateOperationCommand(
				requestUser,
				operationArgs.start,
				null,
				operationArgs.location,
				operationArgs.alarmKeyword,
				operationArgs.assignedUnitIds,
				operationArgs.assignedAlertGroups,
			),
		);
		expect(eventBusMock.publish).toHaveBeenCalledWith(
			new OperationCreatedEvent(requestUser.organizationId, operation),
		);
		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new CreateOperationStartedMessageCommand(
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.sender,
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.recipient,
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.channel,
				{
					id: operation.id,
					sign: operation.sign,
					alarmKeyword: operation.alarmKeyword,
					start: operation.start,
					location: operation.location.address,
					assignedUnits: mockAssignedUnits,
					assignedAlertGroups: mockAssignedAlertGroups,
				},
				requestUser,
			),
		);
	});
});
