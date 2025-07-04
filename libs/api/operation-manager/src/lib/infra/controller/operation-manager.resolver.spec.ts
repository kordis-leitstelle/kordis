import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import {
	MOCK_BASE_CREATE_MESSAGE_ARGS,
	TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
} from '@kordis/api/protocol';
import {
	PresentableValidationException,
	ValidationException,
} from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { LaunchCreateOngoingOperationProcessCommand } from '../../core/command/launch-create-ongoing-operation-process.command';
import { LaunchEndOperationProcessCommand } from '../../core/command/launch-end-operation-process.command';
import { CreateOngoingOperationArgs } from './create-ongoing-operation.args';
import { OperationManagerResolver } from './operation-manager.resolver';

describe('OperationManagerResolver', () => {
	let operationManagerResolver: OperationManagerResolver;
	let mockCommandBus: DeepMocked<CommandBus>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [CqrsModule],
			providers: [OperationManagerResolver],
		})
			.overrideProvider(CommandBus)
			.useValue(createMock())
			.compile();

		operationManagerResolver = moduleRef.get<OperationManagerResolver>(
			OperationManagerResolver,
		);
		mockCommandBus = moduleRef.get(CommandBus);
	});

	const reqUser = {
		organizationId: 'orgId',
	} as AuthUser;

	describe('createOngoingOperation', () => {
		const operationArgs: CreateOngoingOperationArgs = {
			start: new Date(),
			alarmKeyword: 'THWAY',
			location: {
				coordinate: null,
				address: {
					name: 'somewhere',
					street: '',
					city: '',
					postalCode: '',
				},
			},
			assignedUnitIds: ['unitId1', 'unitId2'],
			assignedAlertGroups: [
				{
					alertGroupId: 'alertGroupId',
					assignedUnitIds: ['unitId3', 'unitId4'],
				},
			],
		};

		it('should execute LaunchCreateOperationProcessCommand and return operation', async () => {
			mockCommandBus.execute.mockResolvedValue({
				id: 'someId',
			});

			const result = await operationManagerResolver.createOngoingOperation(
				reqUser,
				{ protocolMessage: MOCK_BASE_CREATE_MESSAGE_ARGS },
				operationArgs,
				{
					alertGroupIds: ['alertGroupId'],
					description: 'somewhere',
					hasPriority: false,
				},
			);

			expect(result).toEqual({
				id: 'someId',
			});
			expect(mockCommandBus.execute).toHaveBeenCalledWith(
				new LaunchCreateOngoingOperationProcessCommand(
					reqUser,
					operationArgs,
					TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
					{
						alertGroupIds: ['alertGroupId'],
						description: 'somewhere',
						hasPriority: false,
					},
				),
			);
		});

		it('should throw PresentableValidationException if arguments are invalid', async () => {
			mockCommandBus.execute.mockRejectedValueOnce(new ValidationException([]));

			await expect(
				operationManagerResolver.createOngoingOperation(
					reqUser,
					{ protocolMessage: MOCK_BASE_CREATE_MESSAGE_ARGS },
					operationArgs,
				),
			).rejects.toThrow(PresentableValidationException);
		});
	});

	it('should end ongoing operation', async () => {
		mockCommandBus.execute.mockResolvedValue({
			id: 'someId',
		});

		const result = await operationManagerResolver.endOngoingOperation(
			reqUser,
			'someId',
			{ protocolMessage: MOCK_BASE_CREATE_MESSAGE_ARGS },
		);

		expect(result).toEqual(true);
		expect(mockCommandBus.execute).toHaveBeenCalledWith(
			new LaunchEndOperationProcessCommand(
				reqUser,
				'someId',
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
			),
		);
	});
});
