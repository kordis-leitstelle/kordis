import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, ICommand, IEvent, QueryBus, ofType } from '@nestjs/cqrs';
import { Observable, mergeMap } from 'rxjs';

import { KordisLogger } from '@kordis/api/observability';
import { OngoingOperationCreatedEvent } from '@kordis/api/operation-manager';

import { UpdateUnitStatusCommand } from '../../../unit/src/lib/core/command/update-unit-status.command';

@Injectable()
export class OperationUnitSaga {
	private readonly logger: KordisLogger = new Logger(OperationUnitSaga.name);

	constructor(
		private readonly queryBus: QueryBus,
		private readonly commandBus: CommandBus,
	) {}

	// if the operation is started, update the status of all units involved to a pending state
	operationStarted = (events$: Observable<IEvent>): Observable<ICommand> =>
		events$.pipe(
			ofType(OngoingOperationCreatedEvent),
			mergeMap((event) => {
				return [
					...event.operation.unitInvolvements,
					...event.operation.alertGroupInvolvements.flatMap(
						({ unitInvolvements }) => unitInvolvements,
					),
				].map(
					({ unit }) =>
						new UpdateUnitStatusCommand(
							event.orgId,
							unit.id,
							null,
							new Date(),
							'System',
						),
				);
			}),
		);
}
