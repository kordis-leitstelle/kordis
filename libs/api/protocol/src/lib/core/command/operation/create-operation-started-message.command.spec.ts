import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../../entity/partials/producer-partial.entity';
import { UnknownUnit } from '../../entity/partials/unit-partial.entity';
import {
	OperationMessageAssignedAlertGroup,
	OperationMessageAssignedUnit,
} from '../../entity/protocol-entries/operation/operation-message.value-objects';
import {
	OperationStartedMessage,
	OperationStartedMessagePayload,
} from '../../entity/protocol-entries/operation/operation-started-message.entity';
import { ProtocolEntryCreatedEvent } from '../../event/protocol-entry-created.event';
import { ProtocolEntryRepository } from '../../repository/protocol-entry.repository';
import {
	AssignedAlertGroup,
	AssignedUnit,
} from '../helper/message-assignments.helper';
import {
	CreateOperationStartedMessageCommand,
	CreateOperationStartedMessageHandler,
} from './create-operation-started-message.command';

const TIME = new Date('2023-10-19T00:00:00');
const OPERATION_DATA = Object.freeze({
	id: '67d5cd788589e9f157b9cd0f',
	sign: 'operation-sign',
	alarmKeyword: 'alarm-keyword',
	start: TIME,
	location: {
		name: 'LocationName',
		street: 'StreetName',
		city: 'CityName',
		postalCode: 'PostalCode',
	},
	assignedUnits: [{ callSign: 'Unit1-Sign', name: 'Unit1' } as AssignedUnit],
	assignedAlertGroups: [
		{
			name: 'AlertGroup',
			assignedUnits: [
				{ callSign: 'Unit2-Sign', name: 'Unit2' } as AssignedUnit,
			],
		} as AssignedAlertGroup,
	],
});

const AUTH_USER = Object.freeze({
	id: 'user-id',
	organizationId: 'org-id',
	firstName: 'John',
	lastName: 'Doe',
} as unknown as AuthUser);

const BASE_EXPECTED = Object.freeze({
	time: TIME,
	searchableText:
		'einsatz alarm-keyword operation-sign gestartet einheiten Unit1 (Unit1-Sign), Unit2 (Unit2-Sign) alarm gruppen AlertGroup',
	payload: plainToInstance(OperationStartedMessagePayload, {
		operationId: OPERATION_DATA.id,
		start: OPERATION_DATA.start,
		operationSign: OPERATION_DATA.sign,
		location: OPERATION_DATA.location,
		assignedAlertGroups: [
			plainToInstance(OperationMessageAssignedAlertGroup, {
				alertGroupName: 'AlertGroup',
				assignedUnits: [{ callSign: 'Unit2-Sign', name: 'Unit2' }],
			}),
		],
		assignedUnits: [
			plainToInstance(OperationMessageAssignedUnit, {
				unitSign: 'Unit1-Sign',
				unitName: 'Unit1',
			}),
		],
	}),
	producer: plainToInstance(UserProducer, {
		userId: AUTH_USER.id,
		firstName: AUTH_USER.firstName,
		lastName: AUTH_USER.lastName,
	}),
	orgId: AUTH_USER.organizationId,
});

describe('CreateOperationStartedMessageCommand', () => {
	let handler: CreateOperationStartedMessageHandler;
	const repositoryMock = createMock<ProtocolEntryRepository>();
	const eventBusMock = createMock<EventBus>();

	beforeAll(() => {
		jest.useFakeTimers({ now: new Date(0) });
	});

	beforeEach(() => {
		handler = new CreateOperationStartedMessageHandler(
			repositoryMock,
			eventBusMock,
		);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should create operation started message protocol communication entry and emit event', async () => {
		const sender = new UnknownUnit();
		sender.name = 'Unit1';
		const recipient = new UnknownUnit();
		recipient.name = 'Unit2';
		const channel = 'A';

		const command = new CreateOperationStartedMessageCommand(
			{
				sender,
				recipient,
				channel,
			},
			OPERATION_DATA,
			AUTH_USER,
		);

		const expectedMsg = plainToInstance(OperationStartedMessage, {
			channel,
			sender,
			recipient,
			...BASE_EXPECTED,
		});

		repositoryMock.create.mockResolvedValueOnce(expectedMsg);

		await handler.execute(command);

		expect(eventBusMock.publish).toHaveBeenCalledWith(
			new ProtocolEntryCreatedEvent('org-id', expectedMsg),
		);
	});

	it('should create operation started message protocol log entry', async () => {
		const command = new CreateOperationStartedMessageCommand(
			null,
			OPERATION_DATA,
			AUTH_USER,
		);
		const time = new Date('2023-10-19T00:00:00');
		const expectedMsg = plainToInstance(OperationStartedMessage, BASE_EXPECTED);

		repositoryMock.create.mockResolvedValueOnce(expectedMsg);

		await handler.execute(command);

		expect(repositoryMock.create).toHaveBeenCalledWith(
			expect.objectContaining({
				time,
				referenceId: OPERATION_DATA.id,
				orgId: AUTH_USER.organizationId,
				searchableText: expect.stringContaining(
					'einsatz alarm-keyword operation-sign gestartet',
				),
			}),
		);

		expect(eventBusMock.publish).toHaveBeenCalledWith(
			new ProtocolEntryCreatedEvent('org-id', expectedMsg),
		);
	});
});
