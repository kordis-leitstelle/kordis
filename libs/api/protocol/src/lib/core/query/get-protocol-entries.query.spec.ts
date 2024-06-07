import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

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
		const orgId = 'orgId';
		const count = 20;
		const sort = 'asc';
		const startingFrom = new Date();
		const command = new GetProtocolEntriesQuery(
			orgId,
			count,
			sort,
			startingFrom,
		);
		await handler.execute(command);

		expect(mockProtocolEntryRepository.getProtocolEntries).toHaveBeenCalledWith(
			orgId,
			count,
			sort,
			startingFrom,
		);
	});
});
