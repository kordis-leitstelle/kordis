import { Injectable, Logger } from '@nestjs/common';
import { ICommand, IEvent, QueryBus, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map, switchMap, tap } from 'rxjs';

import {
	CreateOperationDeploymentCommand,
	RemoveOperationDeploymentCommand,
	SetOperationDeploymentAssignmentsCommand,
} from '@kordis/api/deployment';
import { KordisLogger } from '@kordis/api/observability';
import {
	GetOperationByIdQuery,
	OngoingOperationEndedEvent,
	OngoingOperationInvolvementsUpdatedEvent,
	OperationViewModel,
} from '@kordis/api/operation';
import { OngoingOperationCreatedEvent } from '@kordis/api/operation-manager';

@Injectable()
export class OperationDeploymentSaga {
	private readonly logger: KordisLogger = new Logger(
		OperationDeploymentSaga.name,
	);

	constructor(private readonly queryBus: QueryBus) {}

	// If an ongoing operation is created, create a deployment for it
	@Saga()
	ongoingOperationCreated = (
		events$: Observable<IEvent>,
	): Observable<ICommand> =>
		events$.pipe(
			ofType(OngoingOperationCreatedEvent),
			map(
				(event) =>
					new CreateOperationDeploymentCommand(
						event.orgId,
						event.operation.id,
						event.operation.unitInvolvements.map(
							(involvement) => involvement.unit.id,
						),
						event.operation.alertGroupInvolvements.map((involvement) => ({
							alertGroupId: involvement.alertGroup.id,
							unitIds: involvement.unitInvolvements.map(
								(unitInvolvement) => unitInvolvement.unit.id,
							),
						})),
					),
			),
			tap((event) =>
				this.logger.log('Created deployment from ongoing operation', {
					orgId: event.orgId,
					operationId: event.operationId,
				}),
			),
		);

	// update assignments of an ongoing operation deployment when operation involvements are updated
	@Saga()
	ongoingOperationInvolvementsChanged = (
		events$: Observable<IEvent>,
	): Observable<ICommand> =>
		events$.pipe(
			ofType(OngoingOperationInvolvementsUpdatedEvent),
			switchMap((event) =>
				this.queryBus.execute<GetOperationByIdQuery, OperationViewModel>(
					new GetOperationByIdQuery(event.orgId, event.operationId),
				),
			),
			map(
				(operation) =>
					// naively set the assignments to the same as the involvements
					new SetOperationDeploymentAssignmentsCommand(
						operation.orgId,
						operation.id,
						operation.unitInvolvements.map(
							(involvement) => involvement.unit.id,
						),
						operation.alertGroupInvolvements.map((involvement) => ({
							alertGroupId: involvement.alertGroup.id,
							unitIds: involvement.unitInvolvements.map(
								(unitInvolvement) => unitInvolvement.unit.id,
							),
						})),
					),
			),
			tap((event) =>
				this.logger.log(
					'Updated assignments of operation deployment due to involvement change',
					{
						orgId: event.orgId,
						operationId: event.operationId,
					},
				),
			),
		);

	@Saga()
	ongoingOperationEnded = (events$: Observable<IEvent>): Observable<ICommand> =>
		events$.pipe(
			ofType(OngoingOperationEndedEvent),
			map(
				(event) =>
					new RemoveOperationDeploymentCommand(event.orgId, event.operationId),
			),
			tap((event) =>
				this.logger.log(
					'Removed deployment and assignments of operation deployment due to operation end',
					{
						orgId: event.operationId,
						operationId: event.operationId,
					},
				),
			),
		);
}
