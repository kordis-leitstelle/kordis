import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { AuthUser } from '@kordis/shared/model';

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
		const time = new Date('2023-10-19T00:00:00');
		const channel = 'A';
		const authUser = {
			id: 'user-id',
			organizationId: 'org-id',
			firstName: 'John',
			lastName: 'Doe',
		} as unknown as AuthUser;

		const operationData = {
			id: 'operation-id',
			sign: 'operation-sign',
			alarmKeyword: 'alarm-keyword',
		};

		const command = new CreateOperationEndedMessageCommand(
			authUser,
			sender,
			recipient,
			channel,
			time,
			operationData,
		);

		const expectedMsg = plainToInstance(OperationEndedMessage, {
			sender,
			recipient,
			time,
			searchableText: 'einsatz alarm-keyword operation-sign beendet',
			channel,
			payload: plainToInstance(OperationEndedMessagePayload, {
				operationId: operationData.id,
				operationSign: operationData.sign,
			}),
			producer: {
				userId: authUser.id,
				firstName: authUser.firstName,
				lastName: authUser.lastName,
			},
			orgId: authUser.organizationId,
		});
		repositoryMock.create.mockResolvedValueOnce(expectedMsg);

		await handler.execute(command);

		expect(repositoryMock.create).toHaveBeenCalledWith({
			...expectedMsg,
			createdAt: expect.any(Date),
		});
		expect(eventBusMock.publish).toHaveBeenCalledWith(
			new ProtocolEntryCreatedEvent('org-id', expectedMsg),
		);
	});
});
