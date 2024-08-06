import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import {
	DbSessionProvider,
	UNIT_OF_WORK_SERVICE,
	UnitOfWorkService,
} from '@kordis/api/shared';

import { OperationProcessState } from '../entity/operation-process-state.enum';
import {
	OperationAlertGroupInvolvement,
	OperationUnitInvolvement,
} from '../entity/operation.value-objects';
import { OperationInvolvementsUpdatedEvent } from '../event/operation-involvements-updated.event';
import { OperationNotOngoingException } from '../exceptions/operation-not-ongoing.exception';
import {
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../repository/operation-involvement.repository';
import {
	OPERATION_REPOSITORY,
	OperationRepository,
} from '../repository/operation.repository';
import { OperationInvolvementService } from '../service/unit-involvement/operation-involvement.service';

export class UpdateOngoingOperationInvolvementsCommand {
	constructor(
		readonly orgId: string,
		readonly operationId: string,
		readonly assignedUnitIds: string[],
		readonly alertGroupInvolvements: {
			alertGroupId: string;
			assignedUnitIds: string[];
		}[],
	) {}
}

@CommandHandler(UpdateOngoingOperationInvolvementsCommand)
export class UpdateOngoingOperationInvolvementsHandler
	implements ICommandHandler<UpdateOngoingOperationInvolvementsCommand>
{
	constructor(
		private readonly unitInvolvementService: OperationInvolvementService,
		@Inject(OPERATION_INVOLVEMENT_REPOSITORY)
		private readonly involvementsRepository: OperationInvolvementsRepository,
		@Inject(OPERATION_REPOSITORY)
		private readonly operationRepository: OperationRepository,
		@Inject(UNIT_OF_WORK_SERVICE)
		private readonly uowService: UnitOfWorkService,
		private readonly eventBus: EventBus,
	) {}

	async execute(cmd: UpdateOngoingOperationInvolvementsCommand): Promise<void> {
		await this.uowService.asTransaction(async (uow) => {
			const {
				processState,
				unitInvolvements: currentUnitInvolvements,
				alertGroupInvolvements: currentAlertGroupInvolvements,
			} = await this.operationRepository.findById(
				cmd.orgId,
				cmd.operationId,
				uow,
			);

			if (processState !== OperationProcessState.ON_GOING) {
				throw new OperationNotOngoingException();
			}

			const releaseTime = new Date();

			/*
			 Check units and alert group units and calculate the delta of the current and the newly added units.
			 Those who are removed will receive an end time, set to not pending if previously pending or will be removed completely from the operation if it is a pending unit without involvement times
			 */

			await this.updateUnitInvolvements(
				cmd,
				currentUnitInvolvements,
				null,
				releaseTime,
				uow,
			);
			await this.updateAlertGroupAssignments(
				cmd,
				currentAlertGroupInvolvements,
				releaseTime,
				uow,
			);
		});

		this.eventBus.publish(
			new OperationInvolvementsUpdatedEvent(cmd.orgId, cmd.operationId),
		);
	}

	private async updateUnitInvolvements(
		cmd: UpdateOngoingOperationInvolvementsCommand,
		currentUnitInvolvements: OperationUnitInvolvement[],
		alertGroupId: string | null,
		releaseDate: Date,
		uow: DbSessionProvider,
	): Promise<void> {
		const unitIdsSet = new Set(cmd.assignedUnitIds);
		// end all unit involvements for units that are not in the new list (removed units)
		for (const unitInvolvement of currentUnitInvolvements) {
			if (!unitIdsSet.has(unitInvolvement.unit.id)) {
				await this.involvementsRepository.setEnd(
					cmd.orgId,
					cmd.operationId,
					unitInvolvement.unit.id,
					alertGroupId,
					releaseDate,
					uow,
				);
			} else {
				// unit already present, no need to involve it again
				unitIdsSet.delete(unitInvolvement.unit.id);
			}
		}

		// units that are newly added need to be involved as pending unit
		for (const unitId of unitIdsSet) {
			await this.unitInvolvementService.involveUnitAsPending(
				cmd.orgId,
				cmd.operationId,
				unitId,
				alertGroupId,
				uow,
			);
		}
	}

	private async updateAlertGroupAssignments(
		cmd: UpdateOngoingOperationInvolvementsCommand,
		currentAlertGroupInvolvements: OperationAlertGroupInvolvement[],
		releaseDate: Date,
		uow: DbSessionProvider,
	): Promise<void> {
		const alertGroupIdsSet = new Set(
			cmd.alertGroupInvolvements.map((a) => a.alertGroupId),
		);
		// end all unit involvements of an alert group for units that are not in the new list (removed units)
		for (const alertGroupInvolvement of currentAlertGroupInvolvements) {
			if (!alertGroupIdsSet.has(alertGroupInvolvement.alertGroup.id)) {
				// end all unit involvements of an alert group for units that are not in the new list (removed units)
				for (const { unit } of alertGroupInvolvement.unitInvolvements) {
					await this.involvementsRepository.setEnd(
						cmd.orgId,
						cmd.operationId,
						unit.id,
						alertGroupInvolvement.alertGroup.id,
						releaseDate,
						uow,
					);
				}
			} else {
				await this.updateUnitInvolvements(
					cmd,
					alertGroupInvolvement.unitInvolvements,
					alertGroupInvolvement.alertGroup.id,
					releaseDate,
					uow,
				);
			}
		}
	}
}
