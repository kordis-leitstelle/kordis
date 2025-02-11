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

import { LaunchCreateOperationProcessCommand } from '../../core/command/launch-create-operation-process.command';
import { LaunchEndOperationProcessCommand } from '../../core/command/launch-end-operation-process.command';
import { LaunchUpdateOngoingInvolvementsProcessCommand } from '../../core/command/launch-update-ongoing-involvements-process.command';
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
				operationArgs,
				MOCK_BASE_CREATE_MESSAGE_ARGS,
			);

			expect(result).toEqual({
				id: 'someId',
			});
			expect(mockCommandBus.execute).toHaveBeenCalledWith(
				new LaunchCreateOperationProcessCommand(
					reqUser,
					operationArgs,
					TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
				),
			);
		});

		it('should throw PresentableValidationException if arguments are invalid', async () => {
			mockCommandBus.execute.mockRejectedValueOnce(new ValidationException([]));

			await expect(
				operationManagerResolver.createOngoingOperation(
					reqUser,
					operationArgs,
					MOCK_BASE_CREATE_MESSAGE_ARGS,
				),
			).rejects.toThrow(PresentableValidationException);
		});
	});

	it('should update ongoing operation involvements', async () => {
		const assignmentsData: any = {};

		mockCommandBus.execute.mockResolvedValue({
			id: 'someId',
		});

		const result =
			await operationManagerResolver.updateOngoingOperationInvolvements(
				reqUser,
				'someId',
				assignmentsData,
				MOCK_BASE_CREATE_MESSAGE_ARGS,
			);

		expect(result).toEqual({
			id: 'someId',
		});
		expect(mockCommandBus.execute).toHaveBeenCalledWith(
			new LaunchUpdateOngoingInvolvementsProcessCommand(
				reqUser,
				'someId',
				assignmentsData,
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
			),
		);
	});

	it('should end ongoing operation', async () => {
		mockCommandBus.execute.mockResolvedValue({
			id: 'someId',
		});

		const result = await operationManagerResolver.endOngoingOperation(
			reqUser,
			'someId',
			MOCK_BASE_CREATE_MESSAGE_ARGS,
		);

		expect(result).toEqual({
			id: 'someId',
		});
		expect(mockCommandBus.execute).toHaveBeenCalledWith(
			new LaunchEndOperationProcessCommand(
				reqUser,
				'someId',
				TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS,
			),
		);
	});
});
