import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ProtocolEntryBase } from '../entity/protocol-entries/protocol-entry-base.entity';
import {
	PROTOCOL_ENTRY_REPOSITORY,
	ProtocolEntryRepository,
} from '../repository/protocol-entry.repository';

type UnitInvolvement = {
	unit: { id: string };
	involvementTimes: { start: Date; end: Date | null }[];
};

export class GetByUnitInvolvementsQuery {
	constructor(
		readonly orgId: string,
		readonly unitInvolvements: UnitInvolvement[],
		readonly alertGroupInvolvements: {
			unitInvolvements: UnitInvolvement[];
		}[],
	) {}
}

@QueryHandler(GetByUnitInvolvementsQuery)
export class GetByUnitInvolvementsHandler
	implements IQueryHandler<GetByUnitInvolvementsQuery>
{
	constructor(
		@Inject(PROTOCOL_ENTRY_REPOSITORY)
		private readonly protocolRepository: ProtocolEntryRepository,
	) {}

	execute(query: GetByUnitInvolvementsQuery): Promise<ProtocolEntryBase[]> {
		const units = this.getUnitRangeFromUnitInvolvement(query.unitInvolvements);

		const alertGroupUnits = query.alertGroupInvolvements.flatMap(
			(involvement) =>
				this.getUnitRangeFromUnitInvolvement(involvement.unitInvolvements),
		);

		if (units.length === 0 && alertGroupUnits.length === 0) {
			return Promise.resolve([]);
		}

		return this.protocolRepository.getFromUnitTimes(query.orgId, [
			...units,
			...alertGroupUnits,
		]);
	}

	private getUnitRangeFromUnitInvolvement(
		unitInvolvements: UnitInvolvement[],
	): { unitId: string; range: { start: Date; end: Date | null } }[] {
		return unitInvolvements.flatMap((involvement) =>
			involvement.involvementTimes.map((time) => ({
				unitId: involvement.unit.id,
				range: { start: time.start, end: time.end },
			})),
		);
	}
}
