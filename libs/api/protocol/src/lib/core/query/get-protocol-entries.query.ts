import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProtocolEntryBase } from '../entity/protocol-entries/protocol-entry-base.entity';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../repository/protocol-entry.repository';

export class GetProtocolEntriesQuery {
	constructor(public readonly organizationId: string) {}
}

@QueryHandler(GetProtocolEntriesQuery)
export class GetProtocolEntriesHandler
	implements IQueryHandler<GetProtocolEntriesQuery>
{
	constructor(
		@Inject(PROTOCOL_ENTRY_REPOSITORY)
		private readonly repository: ProtocolEntryRepository,
	) {}

	async execute({
		organizationId,
	}: GetProtocolEntriesQuery): Promise<ProtocolEntryBase[]> {
		return await this.repository.getPaginatedProtocolEntries(organizationId);
	}
}
