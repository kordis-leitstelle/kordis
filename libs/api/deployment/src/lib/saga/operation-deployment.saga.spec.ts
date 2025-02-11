import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { lastValueFrom, of, toArray } from 'rxjs';

import {
	OperationCreatedEvent,
	OperationInvolvementsUpdatedEvent,
	OperationViewModel,
} from '@kordis/api/operation';
import { OperationProcessState } from '@kordis/shared/model';

import { CreateOperationDeploymentCommand } from '../core/command/operation/create-operation-deployment.command';
import { UpdateOperationAssignmentsCommand } from '../core/command/operation/update-operation-assignments.command';
import { OperationDeploymentSaga } from './operation-deployment.saga';

describe('OperationDeploymentSaga', () => {
	let saga: OperationDeploymentSaga;
	let queryBus: DeepMocked<QueryBus>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [OperationDeploymentSaga],
		})
			.overrideProvider(QueryBus)
			.useValue(createMock<QueryBus>())
			.compile();

		saga = moduleRef.get(OperationDeploymentSaga);
		queryBus = moduleRef.get(QueryBus);
	});

	it('should create a deployment for an ongoing operation', async () => {
		const events$ = of(
			new OperationCreatedEvent('org1', {
				id: 'operation1',
				end: null,
				unitInvolvements: [{ unit: { id: 'unit1' } }],
				alertGroupInvolvements: [
					{
						alertGroup: { id: 'alertGroup1' },
						unitInvolvements: [{ unit: { id: 'unit1' } }],
					},
				],
			} as OperationViewModel),
		);

		const expectedCommand = new CreateOperationDeploymentCommand(
			'org1',
			'operation1',
			['unit1'],
			[{ alertGroupId: 'alertGroup1', unitIds: ['unit1'] }],
		);

		await expect(
			lastValueFrom(saga.ongoingOperationCreated(events$).pipe(toArray())),
		).resolves.toEqual([expectedCommand]);
	});

	it('should update assignments of an ongoing operation deployment', async () => {
		const events$ = of(
			new OperationInvolvementsUpdatedEvent('org1', 'operation1'),
		);

		queryBus.execute.mockResolvedValue({
			id: 'operation1',
			orgId: 'org1',
			processState: OperationProcessState.OnGoing,
			unitInvolvements: [{ unit: { id: 'unit1' } }],
			alertGroupInvolvements: [
				{
					alertGroup: { id: 'alertGroup1' },
					unitInvolvements: [{ unit: { id: 'unit1' } }],
				},
			],
		});

		const expectedCommand = new UpdateOperationAssignmentsCommand(
			'org1',
			'operation1',
			['unit1'],
			[{ alertGroupId: 'alertGroup1', unitIds: ['unit1'] }],
		);

		await expect(
			lastValueFrom(saga.operationInvolvementsChanged(events$).pipe(toArray())),
		).resolves.toEqual([expectedCommand]);
	});
});
