import { QueryBus } from '@nestjs/cqrs';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { OperationViewModel } from '@kordis/api/operation';

import { ProtocolEntryBase } from '../../core/entity/protocol-entries/protocol-entry.entity';
import { ProtocolEntryUnion } from '../../core/entity/protocol.entity';
import { GetByUnitInvolvementsQuery } from '../../core/query/get-by-unit-times.query';

@Resolver(() => OperationViewModel)
export class OperationProtocolResolver {
	constructor(private readonly queryBus: QueryBus) {}
	@ResolveField(() => [ProtocolEntryUnion], {
		description:
			'Operation protocol contains all protocol entries of registered units and alert group registered units that have any protocol message during there involvements.',
	})
	protocol(
		@Parent() operation: OperationViewModel,
	): Promise<ProtocolEntryBase[]> {
		return this.queryBus.execute(
			new GetByUnitInvolvementsQuery(
				operation.orgId,
				operation.unitInvolvements,
				operation.alertGroupInvolvements,
			),
		);
	}
}
