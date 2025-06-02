import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../../entity/partials/producer-partial.entity';
import { UnknownUnit } from '../../entity/partials/unit-partial.entity';
import {
	OperationAssignmentsUpdatedMessage,
	OperationAssignmentsUpdatedMessagePayload,
} from '../../entity/protocol-entries/operation/operation-involvements-updated-message.entity';
import {
	OperationMessageAssignedAlertGroup,
	OperationMessageAssignedUnit,
} from '../../entity/protocol-entries/operation/operation-message.value-objects';
import { ProtocolEntryCreatedEvent } from '../../event/protocol-entry-created.event';
import { ProtocolEntryRepository } from '../../repository/protocol-entry.repository';
import {
	AssignedAlertGroup,
	AssignedUnit,
} from '../helper/message-assignments.helper';
import {
	CreateOperationAssignmentsUpdatedMessageCommand,
	CreateOperationAssignmentsUpdatedMessageHandler,
} from './create-operation-assignments-updated-message.command';

describe('CreateOperationAssignmentsUpdatedMessageCommand', () => {
	let handler: CreateOperationAssignmentsUpdatedMessageHandler;
	const repositoryMock = createMock<ProtocolEntryRepository>();
	const eventBusMock = createMock<EventBus>();

	beforeAll(() => {
		jest.useFakeTimers({ now: new Date(0) });
	});

	beforeEach(() => {
		handler = new CreateOperationAssignmentsUpdatedMessageHandler(
			repositoryMock,
			eventBusMock,
		);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should create operation assignments updated message protocol entry and emit event', async () => {
		const sender = new UnknownUnit();
		sender.name = 'Unit1';
		const recipient = new UnknownUnit();
		recipient.name = 'Unit2';
		const time = new Date('2023-10-19T00:00:00');
		const channel = 'A';
		const authUser = {
			id: 'user-id',
			organizationId: 'org-id',
			firstName: 'John',
			lastName: 'Doe',
		} as unknown as AuthUser;

		const assignmentsData = {
			operationId: 'operation-id',
			operationSign: 'operation-sign',
			assignedUnits: [
				{ callSign: 'Unit1-Sign', name: 'Unit1' } as AssignedUnit,
			],
			assignedAlertGroups: [
				{
					name: 'AlertGroup',
					assignedUnits: [
						{ callSign: 'Unit2-Sign', name: 'Unit2' } as AssignedUnit,
					],
				} as AssignedAlertGroup,
			],
		};

		const command = new CreateOperationAssignmentsUpdatedMessageCommand(
			time,
			{
				sender,
				recipient,
				channel,
			},
			assignmentsData,
			authUser,
		);

		const expectedMsg = plainToInstance(OperationAssignmentsUpdatedMessage, {
			channel,
			sender,
			recipient,
			time,
			searchableText:
				'einsatz operation-sign zuordnungen geändert einheiten einheiten Unit1 (Unit1-Sign), Unit2 (Unit2-Sign) alarm gruppen AlertGroup',
			payload: plainToInstance(OperationAssignmentsUpdatedMessagePayload, {
				operationId: assignmentsData.operationId,
				operationSign: assignmentsData.operationSign,
				assignedAlertGroups: [
					plainToInstance(OperationMessageAssignedAlertGroup, {
						alertGroupName: 'AlertGroup',
						assignedUnits: [{ callSign: 'Unit2-Sign', name: 'Unit2' }],
					}),
				],
				assignedUnits: [
					plainToInstance(OperationMessageAssignedUnit, {
						unitSign: 'Unit1-Sign',
						unitName: 'Unit1',
					}),
				],
			}),
			producer: plainToInstance(UserProducer, {
				userId: authUser.id,
				firstName: authUser.firstName,
				lastName: authUser.lastName,
			}),
			orgId: authUser.organizationId,
		});

		repositoryMock.create.mockResolvedValueOnce(expectedMsg);

		await handler.execute(command);

		expect(eventBusMock.publish).toHaveBeenCalledWith(
			new ProtocolEntryCreatedEvent('org-id', expectedMsg),
		);
	});
});
