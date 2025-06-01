import { Injectable, Logger } from '@nestjs/common';
import { ICommand, IEvent, QueryBus, Saga, ofType } from '@nestjs/cqrs';
import { Observable, concatMap, filter, groupBy, mergeMap } from 'rxjs';

import { KordisLogger } from '@kordis/api/observability';
import { NewTetraStatusEvent } from '@kordis/api/tetra';

import { UpdateUnitStatusCommand } from '../../../unit/src/lib/core/command/update-unit-status.command';
import { ALLOWED_PERSISTENT_UNIT_STATUS } from '../../../unit/src/lib/core/entity/status.type';
import { UnitEntity } from '../../../unit/src/lib/core/entity/unit.entity';
import { UnitNotFoundException } from '../../../unit/src/lib/core/exception/unit-not-found.exception';
import { GetUnitByRCSIDQuery } from '../../../unit/src/lib/core/query/get-unit-by-rcs-id.query';

@Injectable()
export class StatusSaga {
	private readonly logger: KordisLogger = new Logger(StatusSaga.name);
	private readonly allowedStatusForPersistentUpdate: Set<number> = new Set(
		ALLOWED_PERSISTENT_UNIT_STATUS,
	);

	constructor(private readonly queryBus: QueryBus) {}

	@Saga()
	tetraStatusReceived = (events$: Observable<IEvent>): Observable<ICommand> =>
		events$.pipe(
			ofType(NewTetraStatusEvent),
			// We only want to process status updates that are allowed to be stored in the database, 0, 5 are temporary statuses and >9 usually do not exist
			filter((event) =>
				this.allowedStatusForPersistentUpdate.has(event.status),
			),
			// We group by the organization and units issi, since we want to make sure these status updates are processed in order, while still allowing for parallel processing of different units
			groupBy((event) => `${event.orgId}${event.issi}`),
			mergeMap((group) =>
				group.pipe(
					concatMap(async (event) => {
						let unit: UnitEntity;
						try {
							unit = await this.queryBus.execute<
								GetUnitByRCSIDQuery,
								UnitEntity
							>(new GetUnitByRCSIDQuery(event.orgId, event.issi));
						} catch (error) {
							if (error instanceof UnitNotFoundException) {
								this.logger.warn(
									'Received status for unit that is not in the database',
									{
										event,
									},
								);
								return null;
							}

							throw error;
						}

						return new UpdateUnitStatusCommand(
							event.orgId,
							unit.id,
							event.status,
							event.sentAt,
							event.source,
						);
					}),
				),
			),
			filter((command): command is UpdateUnitStatusCommand => command != null),
		);
}
