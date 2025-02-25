import { Inject, Injectable } from '@nestjs/common';

import { DbSessionProvider } from '@kordis/api/shared';

import { UnitAlreadyInvolvedException } from '../../exceptions/unit-already-involved.exception';
import {
	CreateUnitInvolvementDto,
	OPERATION_INVOLVEMENT_REPOSITORY,
	OperationInvolvementsRepository,
} from '../../repository/operation-involvement.repository';
import {
	SetAlertGroupInvolvementDto,
	SetUnitInvolvementDto,
} from './unit-involvement.dto';

@Injectable()
export class OperationInvolvementService {
	constructor(
		@Inject(OPERATION_INVOLVEMENT_REPOSITORY)
		private readonly involvementsRepository: OperationInvolvementsRepository,
	) {}

	/*
		Process of setting unit involvements.
		First, removes all involvements of an operations, then verifies that a unit is not involved in another operation (as pending or matching with involvement time) and creates new involvements.
		If involvement times are intercepting with another operation or a unit without an end time is added and it is currently somewhere pending, an exception is thrown!
	 */
	async setUnitInvolvements(
		orgId: string,
		operationId: string,
		unitInvolvements: SetUnitInvolvementDto[],
		alertGroupInvolvements: SetAlertGroupInvolvementDto[],
		uow: DbSessionProvider,
	): Promise<void> {
		await this.involvementsRepository.removeInvolvements(
			orgId,
			operationId,
			uow,
		);

		// check if the unit is pending or involved at the given times
		const createInvolvementDtos = await this.verifyAndCreateDtos(
			orgId,
			operationId,
			unitInvolvements,
			null,
			uow,
		);

		// check if the units of the alert groups are pending or involved at the given times
		for (const alertGroupInvolvement of alertGroupInvolvements) {
			const dtos = await this.verifyAndCreateDtos(
				orgId,
				operationId,
				alertGroupInvolvement.unitInvolvements,
				alertGroupInvolvement.alertGroupId,
				uow,
			);
			createInvolvementDtos.push(...dtos);
		}

		await this.involvementsRepository.createInvolvements(
			orgId,
			operationId,
			createInvolvementDtos,
			uow,
		);
	}

	/*
		Process of setting a unit as pending.
		If the unit is already involved in the operation, it will set the pending state to true.
		If the unit is not involved in the operation, it will release the unit from possible ongoing operations and add it as a pending unit.
	 */
	async involveUnitAsPending(
		orgId: string,
		operationId: string,
		unitId: string,
		alertGroupId: string | null,
		uow?: DbSessionProvider,
	): Promise<void> {
		const involvement =
			await this.involvementsRepository.findOperationInvolvement(
				orgId,
				operationId,
				unitId,
				alertGroupId,
				uow,
			);
		// has involvement in the operation already?
		if (involvement) {
			// we just need to set the pending state of this unit as it was already involved in the operation
			await this.involvementsRepository.setPendingState(
				orgId,
				operationId,
				unitId,
				alertGroupId,
				true,
				uow,
			);
		} else {
			// unit was not involved in the operation, so we need to release it from possible ongoing operations and  add it as a pending unit
			await this.releaseUnitFromPossibleForeignOperation(
				orgId,
				unitId,
				new Date(),
				uow,
			);
			await this.involvementsRepository.createInvolvements(
				orgId,
				operationId,
				[
					{
						orgId,
						operationId,
						unitId,
						alertGroupId,
						isPending: true,
						involvementTimes: [],
					},
				],
				uow,
			);
		}
	}

	/*
		Process of setting the end of an involvement when an operation is ended.
		If the unit is involved in the operation, it will set the end of the involvement.
		If the unit is pending, it will remove the pending state.
	 */
	async endInvolvements(
		orgId: string,
		operationId: string,
		end: Date,
		uow: DbSessionProvider,
	): Promise<void> {
		await this.involvementsRepository.setEndOfAllActive(
			orgId,
			operationId,
			end,
			uow,
		);

		await this.involvementsRepository.removeAllPending(orgId, operationId, uow);
	}

	private async releaseUnitFromPossibleForeignOperation(
		orgId: string,
		unitId: string,
		start: Date,
		uow?: DbSessionProvider,
	): Promise<void> {
		// has the unit an active involvement?
		let involvement =
			await this.involvementsRepository.findByUnitInvolvementTimeRange(
				orgId,
				unitId,
				start,
				null,
				uow,
			);
		if (involvement) {
			// release it (set end of the involvement)
			await this.involvementsRepository.setEnd(
				orgId,
				involvement.operationId,
				unitId,
				involvement.alertGroupId,
				start,
				uow,
			);
			return;
		}
		// has a pending involvement?
		involvement =
			await this.involvementsRepository.findInvolvementOfPendingUnit(
				orgId,
				unitId,
			);
		if (involvement) {
			// remove pending involvement if no involvement times (there is no need to keep the unit)
			if (involvement.involvementTimes.length === 0) {
				await this.involvementsRepository.removeInvolvement(
					orgId,
					involvement.unitId,
					involvement.alertGroupId,
					involvement.operationId,
					uow,
				);
			} else {
				// or set the pending state to false if it has involvement times
				await this.involvementsRepository.setPendingState(
					orgId,
					involvement.operationId,
					involvement.unitId,
					involvement.alertGroupId,
					false,
					uow,
				);
			}
		}
	}

	// check if a unit is involved (pending or open end in an operation) and create the DTOs for the new involvements
	private async verifyAndCreateDtos(
		orgId: string,
		operationId: string,
		involvements: SetUnitInvolvementDto[],
		alertGroupId: string | null,
		uow: DbSessionProvider,
	): Promise<CreateUnitInvolvementDto[]> {
		const createDtos: CreateUnitInvolvementDto[] = [];

		for (const unitInvolvement of involvements) {
			if (unitInvolvement.isPending) {
				await this.assertUnitNotPending(orgId, unitInvolvement.unitId, uow);
			}

			await this.assertUnitNotInvolved(
				orgId,
				unitInvolvement.unitId,
				unitInvolvement.involvementTimes,
				uow,
			);

			createDtos.push({
				orgId,
				operationId,
				alertGroupId,
				isPending: unitInvolvement.isPending,
				involvementTimes: unitInvolvement.involvementTimes,
				unitId: unitInvolvement.unitId,
			});
		}

		return createDtos;
	}

	private async assertUnitNotInvolved(
		orgId: string,
		unitId: string,
		involvements: {
			start: Date;
			end: Date | null;
		}[],
		uow?: DbSessionProvider,
	): Promise<void> {
		for (const involvementRange of involvements) {
			if (!involvementRange.end) {
				await this.assertUnitNotPending(orgId, unitId);
			}

			const involvement =
				await this.involvementsRepository.findByUnitInvolvementTimeRange(
					orgId,
					unitId,
					involvementRange.start,
					involvementRange.end,
					uow,
				);
			if (involvement) {
				throw new UnitAlreadyInvolvedException(
					orgId,
					unitId,
					involvement.operationId,
				);
			}
		}
	}

	private async assertUnitNotPending(
		orgId: string,
		unitId: string,
		uow?: DbSessionProvider,
	): Promise<void | never> {
		const involvement =
			await this.involvementsRepository.findInvolvementOfPendingUnit(
				orgId,
				unitId,
				uow,
			);
		if (involvement) {
			throw new UnitAlreadyInvolvedException(
				orgId,
				unitId,
				involvement.operationId,
			);
		}
	}
}
