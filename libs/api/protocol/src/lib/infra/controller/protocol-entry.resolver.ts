import { QueryBus } from '@nestjs/cqrs';
import {
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
