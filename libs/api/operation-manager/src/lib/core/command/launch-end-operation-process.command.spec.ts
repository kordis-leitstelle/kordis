import { createMock } from '@golevelup/ts-jest';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
	EndOngoingOperationCommand,
	GetOperationByIdQuery,
	OperationViewModel,
} from '@kordis/api/operation';
import {
	CreateOperationEndedMessageCommand,
	TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
} from '@kordis/api/protocol';
import { AuthUser } from '@kordis/shared/model';

import {
	LaunchEndOperationProcessCommand,
	LaunchEndOperationProcessHandler,
} from './launch-end-operation-process.command';

describe('LaunchEndOperationProcessHandler', () => {
	let handler: LaunchEndOperationProcessHandler;
	let commandBusMock: jest.Mocked<CommandBus>;
	let queryBusMock: jest.Mocked<QueryBus>;

	beforeEach(() => {
		commandBusMock = createMock<CommandBus>();
		queryBusMock = createMock<QueryBus>();

		handler = new LaunchEndOperationProcessHandler(
			commandBusMock,
			queryBusMock,
		);
	});

	it('should execute EndOngoingOperationCommand and CreateOperationEndedMessageCommand', async () => {
		const requestUser: AuthUser = { organizationId: 'orgId' } as AuthUser;
		const operationId = 'operationId';

		const command = new LaunchEndOperationProcessCommand(
			requestUser,
			operationId,
			TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
		);

		const operation = {
			id: operationId,
			end: new Date(),
		} as OperationViewModel;
		queryBusMock.execute.mockResolvedValueOnce(operation);

		await handler.execute(command);

		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new EndOngoingOperationCommand(
				requestUser.organizationId,
				operationId,
				expect.any(Date),
			),
		);
		expect(queryBusMock.execute).toHaveBeenCalledWith(
			new GetOperationByIdQuery(requestUser.organizationId, operationId),
		);
		expect(commandBusMock.execute).toHaveBeenCalledWith(
			new CreateOperationEndedMessageCommand(
				requestUser,
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.sender,
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.recipient,
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS.channel,
				operation.end!,
				operation,
			),
		);
	});
});
