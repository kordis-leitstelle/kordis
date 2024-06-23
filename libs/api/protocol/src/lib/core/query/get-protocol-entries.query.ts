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
		public readonly direction: 'preceding' | 'subsequent',
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
		direction,
		startingFrom,
	}: GetProtocolEntriesQuery): Promise<Page<ProtocolEntryBase>> {
		const protocolEntries = await this.repository.getProtocolEntries(
			organizationId,
			count,
			direction,
			startingFrom,
		);

		const page = new Page<ProtocolEntryBase>();
		page.nodes = protocolEntries;
		page.totalEdges =
			await this.repository.getProtocolEntryCount(organizationId);

		page.hasNext =
			direction === 'subsequent' && protocolEntries.length === 0
				? false
				: await this.repository.hasProtocolEntries(
						organizationId,
						'subsequent',
						protocolEntries.at(-1)?.time,
					);
		page.hasPrevious =
			direction === 'preceding' && protocolEntries.length === 0
				? false
				: await this.repository.hasProtocolEntries(
						organizationId,
						'preceding',
						protocolEntries.at(0)?.time,
					);

		return page;
	}
}
