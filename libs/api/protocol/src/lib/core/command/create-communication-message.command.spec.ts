import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';

import { AuthUser } from '@kordis/shared/model';

import { UnknownUnit } from '../entity/partials/unit-partial.entity';
import { CommunicationMessage } from '../entity/protocol-entries/communication-message.entity';
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
		const command = new CreateCommunicationMessageCommand(
			new Date('1913-10-19T00:00:00'),
			sender,
			recipient,
			'🛥️',
			'D',
			{ id: 'user-id', organizationId: 'org-id' } as unknown as AuthUser,
		);

		const commMsg = { id: 'entry-id' } as unknown as CommunicationMessage;
		repositoryMock.create.mockResolvedValueOnce(commMsg);

		const eventPublishSpy = jest.spyOn(eventBusMock, 'publish');

		await handler.execute(command);

		expect(repositoryMock.create).toHaveBeenCalled();
		expect(eventPublishSpy).toHaveBeenCalledWith(
			new ProtocolEntryCreatedEvent('org-id', commMsg),
		);
	});
});
