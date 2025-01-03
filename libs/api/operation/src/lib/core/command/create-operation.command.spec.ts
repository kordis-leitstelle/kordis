import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';

import { uowMockProvider } from '@kordis/api/test-helpers';
import { AuthUser } from '@kordis/shared/model';

import { OperationCreatedEvent } from '../event/operation-created.event';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import {
	SIGN_GENERATOR,
	SignGenerator,
} from '../service/sign-generator/sign-generator.strategy';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';
import {
	CreateOperationCommand,
	CreateOperationHandler,
} from './create-operation.command';

describe('CreateOperationHandler', () => {
	let handler: CreateOperationHandler;
	let mockRepository: DeepMocked<OperationRepository>;
	let mockEventBus: DeepMocked<EventBus>;
	let mockUnitInvolvementService: DeepMocked<OperationInvolvementService>;
	let mockSignGenerator: DeepMocked<SignGenerator>;

	beforeEach(async () => {
		mockRepository = createMock<OperationRepository>();
		mockEventBus = createMock<EventBus>();
		mockUnitInvolvementService = createMock<OperationInvolvementService>();
		mockSignGenerator = createMock<SignGenerator>();

		const moduleRef = await Test.createTestingModule({
			providers: [
				CreateOperationHandler,
				{ provide: OPERATION_REPOSITORY, useValue: mockRepository },
				{ provide: EventBus, useValue: mockEventBus },
				{
					provide: OperationInvolvementService,
					useValue: mockUnitInvolvementService,
				},
				{ provide: SIGN_GENERATOR, useValue: mockSignGenerator },
				uowMockProvider(),
			],
		}).compile();

		handler = moduleRef.get<CreateOperationHandler>(CreateOperationHandler);
	});

	it("should create an ongoing operation if no 'end' is provided and publish an event", async () => {
		const start = new Date();
		const command = new CreateOperationCommand(
			{ id: 'user1', organizationId: 'org1' } as AuthUser,
			start,
			null,
			'alarmKeyword',
			['unit1', 'unit2'],
			[
				{
					alertGroupId: 'alertGroup1',
					assignedUnitIds: ['unit3'],
				},
			],
		);

		mockRepository.create.mockResolvedValue({
			id: 'op1',
		});
		mockSignGenerator.generateNextOperationSign.mockResolvedValue(
			'2024/01/001',
		);

		await handler.execute(command);

		expect(mockRepository.create).toHaveBeenCalledWith(
			'org1',
			{
				alarmKeyword: 'alarmKeyword',
				createdByUserId: 'user1',
				start: start,
				end: null,
				processState: 'ACTIVE',
				sign: '2024/01/001',
			},
			expect.anything(),
		);
		expect(mockUnitInvolvementService.setUnitInvolvements).toHaveBeenCalledWith(
			'org1',
			'op1',
			[
				{
					unitId: 'unit1',
					involvementTimes: [],
					isPending: true,
				},
				{
					unitId: 'unit2',
					involvementTimes: [],
					isPending: true,
				},
			],
			[
				{
					alertGroupId: 'alertGroup1',
					unitInvolvements: [
						{ involvementTimes: [], isPending: true, unitId: 'unit3' },
					],
				},
			],
			expect.anything(),
		);

		expect(mockEventBus.publish).toHaveBeenCalledWith(
			expect.any(OperationCreatedEvent),
		);
	});

	it("should create a completed operation if 'end' is provided and publish an event", async () => {
		const start = new Date('2024-01-01T00:00:00Z');
		const end = new Date('2024-01-01T00:05:00Z');
		const command = new CreateOperationCommand(
			{ id: 'user1', organizationId: 'org1' } as AuthUser,
			start,
			end,
			'alarmKeyword',
			['unit1', 'unit2'],
			[
				{
					alertGroupId: 'alertGroup1',
					assignedUnitIds: ['unit3'],
				},
			],
		);

		mockRepository.create.mockResolvedValue({
			id: 'op1',
		});
		mockSignGenerator.generateNextOperationSign.mockResolvedValue(
			'2024/01/001',
		);

		await handler.execute(command);

		expect(mockRepository.create).toHaveBeenCalledWith(
			'org1',
			{
				alarmKeyword: 'alarmKeyword',
				createdByUserId: 'user1',
				start,
				end,
				processState: 'COMPLETED',
				sign: '2024/01/001',
			},
			expect.anything(),
		);
		expect(mockUnitInvolvementService.setUnitInvolvements).toHaveBeenCalledWith(
			'org1',
			'op1',
			[
				{
					unitId: 'unit1',
					involvementTimes: [
						{
							start,
							end,
						},
					],
					isPending: false,
				},
				{
					unitId: 'unit2',
					involvementTimes: [
						{
							start,
							end,
						},
					],
					isPending: false,
				},
			],
			[
				{
					alertGroupId: 'alertGroup1',
					unitInvolvements: [
						{
							involvementTimes: [
								{
									start,
									end,
								},
							],
							isPending: false,
							unitId: 'unit3',
						},
					],
				},
			],
			expect.anything(),
		);

		expect(mockEventBus.publish).toHaveBeenCalledWith(
			expect.any(OperationCreatedEvent),
		);
	});
});
