import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import { UserProducer } from '../entity/partials/producer-partial.entity';
import { UnknownUnit } from '../entity/partials/unit-partial.entity';
import {
	CommunicationMessage,
	CommunicationMessagePayload,
} from '../entity/protocol-entries/communication-message.entity';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../repository/protocol-entry.repository';
import {
	GetProtocolEntriesHandler,
	GetProtocolEntriesQuery,
} from './get-protocol-entries.query';

describe('GetProtocolEntriesHandler', () => {
	let handler: GetProtocolEntriesHandler;
	const mockProtocolEntryRepository = createMock<ProtocolEntryRepository>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetProtocolEntriesHandler,
				{
					provide: PROTOCOL_ENTRY_REPOSITORY,
					useValue: mockProtocolEntryRepository,
				},
			],
		}).compile();

		handler = module.get<GetProtocolEntriesHandler>(GetProtocolEntriesHandler);
	});

	it('should get protocol entries from repository', async () => {
		const sender = new UnknownUnit();
		sender.name = 'Bob';
		const recipient = new UnknownUnit();
		recipient.name = 'Alice';
		const orgId = 'org-id';

		const commMsg = plainToInstance(CommunicationMessage, {
			sender,
			recipient,
			time: new Date('1913-10-19T00:00:00'),
			searchableText: '🛥️',
			channel: 'D',
			payload: plainToInstance(CommunicationMessagePayload, { message: '🛥️' }),
			producer: plainToInstance(UserProducer, {
				userId: 'user-id',
				firstName: 'John',
				lastName: 'Doe',
			}),
			orgId,
		});

		const count = 20;
		const sort = 'asc';
		const startingFrom = new Date();
		const command = new GetProtocolEntriesQuery(
			orgId,
			count,
			sort,
			startingFrom,
		);
		mockProtocolEntryRepository.getProtocolEntries.mockResolvedValue([commMsg]);
		mockProtocolEntryRepository.getProtocolEntryCount.mockResolvedValue(1);
		mockProtocolEntryRepository.hasProtocolEntries.mockResolvedValue(false);

		const result = await handler.execute(command);

		expect(mockProtocolEntryRepository.getProtocolEntries).toHaveBeenCalledWith(
			orgId,
			count,
			sort,
			startingFrom,
		);
		expect(result.nodes).toHaveLength(1);
		expect(result.nodes[0]).toBe(commMsg);
		expect(result.totalEdges).toBe(1);
		expect(result.hasNext).toBe(false);
		expect(result.hasPrevious).toBe(false);
	});
});
