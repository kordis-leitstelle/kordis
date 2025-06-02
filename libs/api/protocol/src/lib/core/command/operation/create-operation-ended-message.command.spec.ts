import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../../entity/partials/producer-partial.entity';
import { UnknownUnit } from '../../entity/partials/unit-partial.entity';
import {
	OperationEndedMessage,
	OperationEndedMessagePayload,
} from '../../entity/protocol-entries/operation/operation-ended-message.entity';
import { ProtocolEntryCreatedEvent } from '../../event/protocol-entry-created.event';
import { ProtocolEntryRepository } from '../../repository/protocol-entry.repository';
import {
	CreateOperationEndedMessageCommand,
	CreateOperationEndedMessageHandler,
} from './create-operation-ended-message.command';

const AUTH_USER = Object.freeze({
	id: 'user-id',
	organizationId: 'org-id',
	firstName: 'John',
	lastName: 'Doe',
} as unknown as AuthUser);
const TIME = new Date('2023-10-19T00:00:00');
const OPERATION_DATA = Object.freeze({
	id: '67d5d14d14bc968a6a308358',
	sign: 'operation-sign',
	alarmKeyword: 'alarm-keyword',
});

const BASE_EXPECTED = Object.freeze({
	time: TIME,
	searchableText: 'einsatz alarm-keyword operation-sign beendet',
	payload: plainToInstance(OperationEndedMessagePayload, {
		operationId: OPERATION_DATA.id,
		operationSign: OPERATION_DATA.sign,
	}),
	producer: plainToInstance(UserProducer, {
		userId: AUTH_USER.id,
		firstName: AUTH_USER.firstName,
		lastName: AUTH_USER.lastName,
	}),
	referenceId: OPERATION_DATA.id,
	orgId: AUTH_USER.organizationId,
});

describe('CreateOperationEndedMessageCommand', () => {
	let handler: CreateOperationEndedMessageHandler;
	const repositoryMock = createMock<ProtocolEntryRepository>();
	const eventBusMock = createMock<EventBus>();

	beforeAll(() => {
		jest.useFakeTimers({ now: new Date(0) });
	});

	beforeEach(() => {
		handler = new CreateOperationEndedMessageHandler(
			repositoryMock,
			eventBusMock,
		);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should create operation ended message protocol entry and emit event', async () => {
		const sender = new UnknownUnit();
		sender.name = 'Unit1';
		const recipient = new UnknownUnit();
		recipient.name = 'Unit2';
		const channel = 'A';

		const command = new CreateOperationEndedMessageCommand(
			AUTH_USER,
			{
				sender,
				recipient,
				channel,
			},
			TIME,
			OPERATION_DATA,
		);

		const expectedMsg = plainToInstance(OperationEndedMessage, {
			communicationDetails: {
				sender,
				recipient,
				channel,
			},
			...BASE_EXPECTED,
		});
		repositoryMock.create.mockResolvedValueOnce(expectedMsg);

		await handler.execute(command);
		(expectedMsg.createdAt as any) = expect.any(Date);
		expect(repositoryMock.create).toHaveBeenCalledWith(expectedMsg);
		expect(eventBusMock.publish).toHaveBeenCalledWith(
			new ProtocolEntryCreatedEvent('org-id', expectedMsg),
		);
	});

	it('should create operation ended log message when no protocol data is provided', async () => {
		const command = new CreateOperationEndedMessageCommand(
			AUTH_USER,
			null, // No protocol data
			TIME,
			OPERATION_DATA,
		);
		const expectedMsg = plainToInstance(OperationEndedMessage, BASE_EXPECTED);

		repositoryMock.create.mockResolvedValueOnce(expectedMsg);

		await handler.execute(command);

		expect(repositoryMock.create).toHaveBeenCalledWith(
			expect.objectContaining({
				time: TIME,
				referenceId: OPERATION_DATA.id,
				orgId: AUTH_USER.organizationId,
				searchableText: 'einsatz alarm-keyword operation-sign beendet',
			}),
		);

		expect(eventBusMock.publish).toHaveBeenCalledWith(
			new ProtocolEntryCreatedEvent('org-id', expectedMsg),
		);
	});
});
