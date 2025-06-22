import { DbSessionProvider } from '@kordis/api/shared';

import { UpdateOngoingOperationInvolvementsCommand } from '../command/update-ongoing-operation-involvements.command';
import {
	OperationInvolvementsRepository,
	UnitInvolvement,
} from '../repository/operation-involvement.repository';
import { OperationInvolvementService } from './unit-involvement/operation-involvement.service';

export class UpdatedInvolvementsManager {
	private currentUnitIdsSet = new Set<string>();
	private currentAlertGroupUnitMap = new Map<string, Set<string>>();
	private pendingInvolvementMap = new Map<string, boolean>();

	constructor(
		private readonly involvementService: OperationInvolvementService,
		private readonly operationInvolvementsRepository: OperationInvolvementsRepository,
		private readonly command: UpdateOngoingOperationInvolvementsCommand,
		private readonly endDate: Date,
		private readonly uow: DbSessionProvider,
	) {}

	public async initialize(): Promise<void> {
		const currentInvolvements =
			await this.operationInvolvementsRepository.findOperationOngoingInvolvements(
				this.command.orgId,
				this.command.operationId,
				this.uow,
			);
		this.buildInvolvementSets(currentInvolvements);
	}

	/**
	 * Process current involvements to build sets of existing units
	 * @param currentInvolvements Current unit involvements
	 */
	private buildInvolvementSets(currentInvolvements: UnitInvolvement[]): void {
		this.currentUnitIdsSet.clear();
		this.currentAlertGroupUnitMap.clear();
		this.pendingInvolvementMap.clear();

		for (const { alertGroupId, unitId, isPending } of currentInvolvements) {
			if (alertGroupId) {
				if (!this.currentAlertGroupUnitMap.has(alertGroupId)) {
					this.currentAlertGroupUnitMap.set(alertGroupId, new Set());
				}
				this.currentAlertGroupUnitMap.get(alertGroupId)?.add(unitId);
			} else {
				this.currentUnitIdsSet.add(unitId);
			}
			this.pendingInvolvementMap.set(unitId, isPending);
		}
	}

	public async handleUnitInvolvements(): Promise<void> {
		for (const unitId of this.command.assignedUnitIds) {
			if (!this.currentUnitIdsSet.delete(unitId)) {
				await this.involvementService.involveUnitAsPending(
					this.command.orgId,
					this.command.operationId,
					unitId,
					null,
					this.uow,
				);
			}
		}

		for (const unitId of this.currentUnitIdsSet) {
			await this.removeUnit(
				unitId,
				null,
				this.pendingInvolvementMap.get(unitId) || false,
			);
		}
	}

	/**
	 * Process all alert group involvements, involve new units with alert groups and remove units that are no longer involved
	 */
	public async handleAlertGroupInvolvements(): Promise<void> {
		for (const { alertGroupId, assignedUnitIds } of this.command
			.alertGroupInvolvements) {
			const currentUnits =
				this.currentAlertGroupUnitMap.get(alertGroupId) || new Set();

			for (const unitId of assignedUnitIds) {
				if (!currentUnits.delete(unitId)) {
					await this.involvementService.involveUnitAsPending(
						this.command.orgId,
						this.command.operationId,
						unitId,
						alertGroupId,
						this.uow,
					);
				}
			}

			for (const unitId of currentUnits) {
				await this.removeUnit(
					unitId,
					alertGroupId,
					this.pendingInvolvementMap.get(unitId) || false,
				);
			}

			this.currentAlertGroupUnitMap.delete(alertGroupId);
		}

		for (const [alertGroupId, remainingUnits] of this
			.currentAlertGroupUnitMap) {
			for (const unitId of remainingUnits) {
				await this.removeUnit(
					unitId,
					alertGroupId,
					this.pendingInvolvementMap.get(unitId) || false,
				);
			}
		}
	}

	/**
	 * Helper method to handle unit involvement removal from the current operation based on pending status
	 * @param unitId Unit ID to remove
	 * @param alertGroupId Alert group ID (null for direct unit involvements)
	 * @param isPending Whether the unit involvement is pending
	 */
	private async removeUnit(
		unitId: string,
		alertGroupId: string | null,
		isPending: boolean,
	): Promise<void> {
		if (isPending) {
			await this.operationInvolvementsRepository.removeInvolvement(
				this.command.orgId,
				unitId,
				alertGroupId,
				this.command.operationId,
				this.uow,
			);
		} else {
			await this.operationInvolvementsRepository.setEnd(
				this.command.orgId,
				this.command.operationId,
				unitId,
				alertGroupId,
				this.endDate,
				this.uow,
			);
		}
	}
}
