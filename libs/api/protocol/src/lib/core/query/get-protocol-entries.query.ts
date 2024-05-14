import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Page } from '../entity/page.entity';
import { ProtocolEntryBase } from '../entity/protocol-entries/protocol-entry-base.entity';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../repository/protocol-entry.repository';

export class GetProtocolEntriesQuery {
	constructor(
		public readonly organizationId: string,
		public readonly count: number,
		public readonly sort: 'asc' | 'desc',
		public readonly startingFrom?: Date,
	) {}
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
		count,
		sort,
		startingFrom,
	}: GetProtocolEntriesQuery): Promise<Page<ProtocolEntryBase>> {
		const protocolEntries = await this.repository.getProtocolEntries(
			organizationId,
			count,
			sort,
			startingFrom,
		);

		if (sort === 'asc') {
			protocolEntries.reverse();
		}

		const slice = new Page<ProtocolEntryBase>();
		slice.nodes = protocolEntries;
		slice.totalEdges =
			await this.repository.getProtocolEntryCount(organizationId);

		slice.hasNext =
			sort === 'desc' && protocolEntries.length === 0
				? false
				: await this.repository.hasProtocolEntries(
						organizationId,
						'desc',
						protocolEntries.at(-1)?.time,
					);
		slice.hasPrevious =
			sort === 'asc' && protocolEntries.length === 0
				? false
				: await this.repository.hasProtocolEntries(
						organizationId,
						'asc',
						protocolEntries.at(0)?.time,
					);

		return slice;
	}
}
