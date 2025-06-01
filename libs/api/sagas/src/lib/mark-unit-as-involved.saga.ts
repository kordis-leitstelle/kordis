import { Injectable, Logger } from '@nestjs/common';
import { ICommand, IEvent, QueryBus, Saga, ofType } from '@nestjs/cqrs';
import { Observable, concatMap, filter, groupBy, mergeMap } from 'rxjs';

import { KordisLogger } from '@kordis/api/observability';
import { StartPendingUnitInvolvementCommand } from '@kordis/api/operation';
import { GetOperationIdOfPendingUnitQuery } from '@kordis/api/operation';
import { UnitStatusUpdatedEvent } from '@kordis/api/unit';

@Injectable()
export class MarkUnitAsInvolvedSaga {
	private readonly logger: KordisLogger = new Logger(
		MarkUnitAsInvolvedSaga.name,
	);
	private readonly operationStatus: ReadonlySet<number> = new Set([3, 4]);

	constructor(private readonly queryBus: QueryBus) {}

	@Saga()
	operationStatusReceived = (
		events$: Observable<IEvent>,
	): Observable<ICommand> =>
		events$.pipe(
			ofType(UnitStatusUpdatedEvent),
			filter(
				({ status }: UnitStatusUpdatedEvent) =>
					status.status != null && this.operationStatus.has(status.status),
			),
			// We group by the organization and units id, since we want to make sure these status updates are processed in order, while still allowing for parallel processing of different units
			groupBy((event) => `${event.orgId}${event.unitId}`),
			mergeMap((group) =>
				group.pipe(
					concatMap(async ({ orgId, unitId, status: { receivedAt } }) => {
						const operationIdOfUnit = await this.queryBus.execute(
							new GetOperationIdOfPendingUnitQuery(orgId, unitId),
						);
						if (!operationIdOfUnit) {
							return null;
						}

						this.logger.log(
							`Received operation status, marking unit as involved: ${unitId}`,
						);

						return new StartPendingUnitInvolvementCommand(
							orgId,
							unitId,
							operationIdOfUnit,
							receivedAt,
						);
					}),
				),
			),
			filter(
				(command): command is StartPendingUnitInvolvementCommand =>
					command != null,
			),
		);
}
