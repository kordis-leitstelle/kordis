import { QueryBus } from '@nestjs/cqrs';
import { Query, Resolver } from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import { AuthUser } from '@kordis/shared/model';

import { ProtocolEntryBase } from '../../core/entity/protocol-entries/protocol-entry-base.entity';
import { ProtocolEntryUnion } from '../../core/entity/protocol.entity';
import { GetProtocolEntriesQuery } from '../../core/query/get-protocol-entries.query';

@Resolver()
export class ProtocolEntryResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@Query(() => [ProtocolEntryUnion])
	async protocolEntries(
		@RequestUser() reqUser: AuthUser,
	): Promise<ProtocolEntryBase[]> {
		return await this.queryBus.execute<GetProtocolEntriesQuery>(
			new GetProtocolEntriesQuery(reqUser.organizationId),
		);
	}
}
