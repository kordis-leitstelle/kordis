import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { after, before } from 'node:test';

import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../entity/partials/producer-partial.entity';
import { UnknownUnit } from '../entity/partials/unit-partial.entity';
import {
	CommunicationMessage,
	CommunicationMessagePayload,
} from '../entity/protocol-entries/communication-message.entity';
import { ProtocolEntryCreatedEvent } from '../event/protocol-entry-created.event';
import { ProtocolEntryRepository } from '../repository/protocol-entry.repository';
import {
	CreateCommunicationMessageCommand,
	CreateCommunicationMessageHandler,
} from './create-communication-message.command';

describe('CreateCommunicationMessageCommand', () => {
	let handler: CreateCommunicationMessageHandler;
	const repositoryMock = createMock<ProtocolEntryRepository>();
	const eventBusMock = createMock<EventBus>();

	before(() => {
		jest.useFakeTimers({ now: new Date(0) });
	});

	beforeEach(() => {
		handler = new CreateCommunicationMessageHandler(
			repositoryMock,
			eventBusMock,
		);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should create communication message protocol entry and emit event', async () => {
		const sender = new UnknownUnit();
		sender.name = 'Bob';
		const recipient = new UnknownUnit();
		recipient.name = 'Alice';
		const time = new Date('1913-10-19T00:00:00');
		const message = '🛥️';
		const channel = 'D';
		const authUser = {
			id: 'user-id',
			organizationId: 'org-id',
			firstName: 'John',
			lastName: 'Doe',
		} as unknown as AuthUser;

		const command = new CreateCommunicationMessageCommand(
			time,
			sender,
			recipient,
			message,
			channel,
			authUser,
		);

		const expectedCommMsg = plainToInstance(CommunicationMessage, {
			sender,
			recipient,
			time,
			searchableText: message,
			channel,
			payload: plainToInstance(CommunicationMessagePayload, { message }),
			producer: plainToInstance(UserProducer, {
				userId: authUser.id,
				firstName: authUser.firstName,
				lastName: authUser.lastName,
			}),
			orgId: authUser.organizationId,
		});
		repositoryMock.create.mockResolvedValueOnce(expectedCommMsg);

		await handler.execute(command);

		expect(repositoryMock.create).toHaveBeenCalledWith(expectedCommMsg);
		expect(eventBusMock.publish).toHaveBeenCalledWith(
			new ProtocolEntryCreatedEvent('org-id', expectedCommMsg),
		);
	});
});
