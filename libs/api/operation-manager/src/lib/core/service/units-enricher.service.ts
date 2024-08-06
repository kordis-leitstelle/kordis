import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import {
	AlertGroupViewModel,
	GetAlertGroupsByIdsQuery,
	GetUnitsByIdsQuery,
	UnitViewModel,
} from '@kordis/api/unit';

export interface AssignedUnit {
	id: string;
	name: string;
	callSign: string;
}

export interface AssignmentsData {
	assignedUnits: AssignedUnit[];
	assignedAlertGroups: {
		id: string;
		name: string;
		assignedUnits: AssignedUnit[];
	}[];
}

@Injectable()
export class UnitsEnricherService {
	constructor(private readonly queryBus: QueryBus) {}

	async getEnrichedUnitsAndAlertGroups(
		unitIds: string[],
		alertGroups: {
			alertGroupId: string;
			assignedUnitIds: string[];
		}[],
	): Promise<AssignmentsData> {
		// get all units
		const units: UnitViewModel[] = await this.queryBus.execute(
			new GetUnitsByIdsQuery(
				[
					...unitIds,
					...alertGroups.flatMap((involvement) => involvement.assignedUnitIds),
				],
				{ retainOrder: true },
			),
		);

		// get the subset of units that are assigned to the operation but not in an alert group
		const assignedUnits = units.splice(0, unitIds.length).map((unit) => ({
			name: unit.name,
			callSign: unit.callSign,
			id: unit.id,
		}));

		const assignedAlertGroups = await this.getEnrichedAlertGroups(
			alertGroups,
			units,
		);

		return {
			assignedUnits,
			assignedAlertGroups,
		};
	}

	private async getEnrichedAlertGroups(
		alertGroupsToEnrich: {
			alertGroupId: string;
			assignedUnitIds: string[];
		}[],
		alertGroupUnits: UnitViewModel[],
	): Promise<AssignmentsData['assignedAlertGroups']> {
		// get the assigned alertgroups
		const alertGroups: AlertGroupViewModel[] = await this.queryBus.execute(
			new GetAlertGroupsByIdsQuery(
				alertGroupsToEnrich.map((involvement) => involvement.alertGroupId),
			),
		);

		// map with the remainingUnits
		return alertGroups.map((value, i) => ({
			id: value.id,
			name: value.name,
			assignedUnits: alertGroupUnits
				.splice(0, alertGroupsToEnrich[i].assignedUnitIds.length)
				.map((unit) => ({
					id: unit.id,
					name: unit.name,
					callSign: unit.callSign,
				})),
		}));
	}
}
