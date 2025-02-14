import { createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../../entity/partials/producer-partial.entity';
import { UnknownUnit } from '../../entity/partials/unit-partial.entity';
import {
	OperationMessageAssignedAlertGroup,
	OperationMessageAssignedUnit,
} from '../../entity/protocol-entries/operation/operation-message.value-objects';
import {
	OperationStartedMessage,
	OperationStartedMessagePayload,
} from '../../entity/protocol-entries/operation/operation-started-message.entity';
import { ProtocolEntryCreatedEvent } from '../../event/protocol-entry-created.event';
import { ProtocolEntryRepository } from '../../repository/protocol-entry.repository';
import {
	AssignedAlertGroup,
	AssignedUnit,
} from '../helper/message-assignments.helper';
import {
	CreateOperationStartedMessageCommand,
	CreateOperationStartedMessageHandler,
} from './create-operation-started-message.command';

describe('CreateOperationStartedMessageCommand', () => {
	let handler: CreateOperationStartedMessageHandler;
	const repositoryMock = createMock<ProtocolEntryRepository>();
	const eventBusMock = createMock<EventBus>();

	beforeAll(() => {
		jest.useFakeTimers({ now: new Date(0) });
	});

	beforeEach(() => {
		handler = new CreateOperationStartedMessageHandler(
			repositoryMock,
			eventBusMock,
		);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should create operation started message protocol entry and emit event', async () => {
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

		const operationData = {
			id: 'operation-id',
			sign: 'operation-sign',
			alarmKeyword: 'alarm-keyword',
			start: time,
			location: {
				name: 'LocationName',
				street: 'StreetName',
				city: 'CityName',
				postalCode: 'PostalCode',
			},
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

		const command = new CreateOperationStartedMessageCommand(
			sender,
			recipient,
			channel,
			operationData,
			authUser,
		);

		const expectedMsg = plainToInstance(OperationStartedMessage, {
			channel,
			sender,
			recipient,
			time,
			searchableText:
				'einsatz alarm-keyword operation-sign gestartet einheiten Unit1 (Unit1-Sign), Unit2 (Unit2-Sign) alarm gruppen AlertGroup',
			payload: plainToInstance(OperationStartedMessagePayload, {
				operationId: operationData.id,
				start: operationData.start,
				operationSign: operationData.sign,
				location: operationData.location,
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
