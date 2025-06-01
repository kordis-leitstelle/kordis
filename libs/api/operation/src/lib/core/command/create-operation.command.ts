import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import type { KordisLogger } from '@kordis/api/observability';
import {
	DbSessionProvider,
	UNIT_OF_WORK_SERVICE,
	UnitOfWorkService,
} from '@kordis/api/shared';
import { AuthUser } from '@kordis/shared/model';

import { PresentableUnitsNotUniqueException } from '../../infra/exception/presentable-units-not-unique.exception';
import { OperationProcessState } from '../entity/operation-process-state.enum';
import { OperationEntity } from '../entity/operation.entity';
import { OperationLocation } from '../entity/operation.value-objects';
import { OperationCreatedEvent } from '../event/operation-created.event';
import { CreateOperationDto } from '../repository/dto/create-operation.dto';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import {
	SIGN_GENERATOR,
	SignGenerator,
} from '../service/sign-generator/sign-generator.strategy';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';

export class CreateOperationCommand {
	constructor(
		readonly requestUser: AuthUser,
		readonly start: Date,
		readonly end: Date | null,
		readonly location: {
			address: {
				name: string;
				street: string;
				postalCode: string;
				city: string;
			};
			coordinate: {
				lat: number;
				lon: number;
			} | null;
		},
		readonly alarmKeyword: string,
		readonly assignedUnitIds: string[],
		readonly assignedAlertGroups: {
			alertGroupId: string;
			assignedUnitIds: string[];
		}[],
	) {}
}

@CommandHandler(CreateOperationCommand)
export class CreateOperationHandler
	implements ICommandHandler<CreateOperationCommand>
{
	private readonly logger: KordisLogger = new Logger(
		CreateOperationHandler.name,
	);

	constructor(
		@Inject(OPERATION_REPOSITORY)
		private readonly operationRepository: OperationRepository,
		private readonly eventBus: EventBus,
		private readonly operationInvolvementService: OperationInvolvementService,
		@Inject(SIGN_GENERATOR) private readonly signGenerator: SignGenerator,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uowService: UnitOfWorkService,
	) {}

	async execute(cmd: CreateOperationCommand): Promise<OperationEntity> {
		// verify that each unit is only present once
		this.assertUnitsOnlyPresentOnce(cmd);

		// create and validate operation
		let operation: OperationEntity | undefined;
		await this.uowService.asTransaction(async (uow) => {
			const createOperationDto = this.createDtoFromCommand(cmd);
			createOperationDto.sign =
				await this.signGenerator.generateNextOperationSign(
					cmd.requestUser.organizationId,
					uow,
				);

			await createOperationDto.validOrThrow();

			const { id } = await this.operationRepository.create(
				cmd.requestUser.organizationId,
				createOperationDto,
				uow,
			);

			if (createOperationDto?.end) {
				// if the operation has an end, we want to assign the units with the start and end date
				await this.setUnitInvolvements(id, cmd, uow);
			} else {
				// if the operation is active, we want to assign the units with the start date, this flow indicates a ongoing operation, where assigned units get release from currently involved operations
				await this.involveUnits(id, cmd, uow);
			}

			operation = await this.operationRepository.findById(
				cmd.requestUser.organizationId,
				id,
				uow,
			);
		}, 3);

		if (operation == null) {
			throw new Error('Operation was not created');
		}

		this.logger.log(
			`Operation ${operation.sign} created for organization ${cmd.requestUser.organizationId}`,
		);

		this.eventBus.publish(
			new OperationCreatedEvent(cmd.requestUser.organizationId, operation),
		);

		return operation;
	}

	private createDtoFromCommand(
		command: CreateOperationCommand,
	): CreateOperationDto {
		const dto = new CreateOperationDto();
		dto.start = command.start;
		dto.end = command.end;
		dto.createdByUserId = command.requestUser.id;
		dto.alarmKeyword = command.alarmKeyword;
		dto.processState = dto.end
			? OperationProcessState.COMPLETED
			: OperationProcessState.ON_GOING;
		dto.location = plainToInstance(OperationLocation, command.location);
		return dto;
	}

	private async involveUnits(
		operationId: string,
		cmd: CreateOperationCommand,
		uow: DbSessionProvider,
	): Promise<void> {
		for (const unitId of cmd.assignedUnitIds) {
			await this.operationInvolvementService.involveUnitAsPending(
				cmd.requestUser.organizationId,
				operationId,
				unitId,
				null,
				uow,
			);
		}

		for (const alertGroup of cmd.assignedAlertGroups) {
			for (const unitId of alertGroup.assignedUnitIds) {
				await this.operationInvolvementService.involveUnitAsPending(
					cmd.requestUser.organizationId,
					operationId,
					unitId,
					alertGroup.alertGroupId,
					uow,
				);
			}
		}
	}

	private async setUnitInvolvements(
		operationId: string,
		cmd: CreateOperationCommand,
		uow: DbSessionProvider,
	): Promise<void> {
		// if the operation is completed, unit involvement should receive the start and end date,
		// if it is active added units are in pending state
		const baseUnitInvolvement = {
			involvementTimes: [
				{
					start: cmd.start,
					end: cmd.end,
				},
			],
			isPending: false,
		};

		// set unit involvements with the involvement times and the pending status
		await this.operationInvolvementService.setUnitInvolvements(
			cmd.requestUser.organizationId,
			operationId,
			cmd.assignedUnitIds.map((unitId) => ({
				unitId,
				...baseUnitInvolvement,
			})),
			cmd.assignedAlertGroups.map((alertGroup) => ({
				alertGroupId: alertGroup.alertGroupId,
				unitInvolvements: alertGroup.assignedUnitIds.map((unitId) => ({
					unitId,
					...baseUnitInvolvement,
				})),
			})),
			uow,
		);
	}

	private assertUnitsOnlyPresentOnce({
		assignedUnitIds,
		assignedAlertGroups,
	}: CreateOperationCommand): void {
		const unitIds = [
			...assignedUnitIds,
			...assignedAlertGroups.flatMap((u) => u.assignedUnitIds),
		];

		const unitIdCounts = new Map<string, number>();
		const nonUniqueUnitIds = new Set<string>();

		for (const unitId of unitIds) {
			const count = unitIdCounts.get(unitId) ?? 0;
			unitIdCounts.set(unitId, count + 1);
			if (count + 1 > 1) {
				nonUniqueUnitIds.add(unitId);
			}
		}

		if (nonUniqueUnitIds.size > 0) {
			throw new PresentableUnitsNotUniqueException(
				Array.from(nonUniqueUnitIds),
			);
		}
	}
}
