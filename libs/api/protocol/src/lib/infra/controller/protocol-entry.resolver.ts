import { QueryBus } from '@nestjs/cqrs';
import {
	Args,
	Context,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';

import { RequestUser } from '@kordis/api/auth';
import { DataLoaderContextProvider } from '@kordis/api/shared';
import { UNITS_DATA_LOADER, UnitViewModel } from '@kordis/api/unit';
import { AuthUser } from '@kordis/shared/model';

import { RegisteredUnit } from '../../core/entity/partials/unit-partial.entity';
import { GetProtocolEntriesQuery } from '../../core/query/get-protocol-entries.query';
import { ProtocolEntryConnectionBuilder } from '../service/protocol-entry-connection.builder';
import { ProtocolEntryConnection } from '../view-model/protocol-entry.connection';
import { ProtocolEntryConnectionArgs } from '../view-model/protocol-entry.connection-args';

@Resolver()
export class ProtocolEntryResolver {
	constructor(private readonly queryBus: QueryBus) {}

	@Query(() => ProtocolEntryConnection, {
		description: 'Returns protocol entries sorted by time desc.',
	})
	async protocolEntries(
		@RequestUser() reqUser: AuthUser,
		@Args() connectionArgs: ProtocolEntryConnectionArgs,
	): Promise<ProtocolEntryConnection> {
		const connbuilder = new ProtocolEntryConnectionBuilder(connectionArgs);

		const startingFrom = connbuilder.getStartDate();

		const protocolEntrySlice = await this.queryBus.execute(
			new GetProtocolEntriesQuery(
				reqUser.organizationId,
				connbuilder.edgesPerPage,
				connbuilder.beforeCursor ? 'preceding' : 'subsequent',
				startingFrom,
			),
		);

		return connbuilder.build({
			hasNextPage: protocolEntrySlice.hasNext,
			hasPreviousPage: protocolEntrySlice.hasPrevious,
			totalEdges: protocolEntrySlice.totalEdges,
			nodes: protocolEntrySlice.nodes,
		});
	}
}

@Resolver(() => RegisteredUnit)
export class RegisteredUnitResolver {
	@ResolveField()
	async unit(
		@Parent() { unit }: RegisteredUnit,
		@Context()
		{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<UnitViewModel> {
		const loader = loadersProvider.getLoader<string, UnitViewModel>(
			UNITS_DATA_LOADER,
		);
		return loader.load(unit.id);
	}
}
