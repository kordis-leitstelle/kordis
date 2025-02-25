import { Injectable, Logger } from '@nestjs/common';
import { ICommand, IEvent, QueryBus, Saga, ofType } from '@nestjs/cqrs';
import { Observable, filter, map, switchMap, tap } from 'rxjs';

import { KordisLogger } from '@kordis/api/observability';
import {
	GetOperationByIdQuery,
	OperationInvolvementsUpdatedEvent,
} from '@kordis/api/operation';
import { OngoingOperationCreatedEvent } from '@kordis/api/operation-manager';
import { Operation, OperationProcessState } from '@kordis/shared/model';

import { CreateOperationDeploymentCommand } from '../core/command/operation/create-operation-deployment.command';
import { UpdateOperationAssignmentsCommand } from '../core/command/operation/update-operation-assignments.command';

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
			filter((event) => event.operation.end == null), // todo: this should not be done, use explicit opngoing operation created
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

	// update assignments of an operation deployment when operation involvements are updated
	@Saga()
	operationInvolvementsChanged = (
		events$: Observable<IEvent>,
	): Observable<ICommand> =>
		events$.pipe(
			ofType(OperationInvolvementsUpdatedEvent),
			switchMap((event) =>
				this.queryBus.execute<GetOperationByIdQuery, Operation>(
					new GetOperationByIdQuery(event.orgId, event.operationId),
				),
			),
			filter(
				(operation) => operation.processState === OperationProcessState.OnGoing,
			),
			map(
				(operation) =>
					new UpdateOperationAssignmentsCommand(
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
}
