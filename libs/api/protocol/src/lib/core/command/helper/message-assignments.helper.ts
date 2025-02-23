import {
	OperationMessageAssignedAlertGroup,
	OperationMessageAssignedUnit,
} from '../../entity/protocol-entries/operation/operation-message.value-objects';

export interface AssignedUnit {
	id: string;
	name: string;
	callSign: string;
}

export interface AssignedAlertGroup {
	id: string;
	name: string;
	assignedUnits: AssignedUnit[];
}

export function setAssignmentsOnPayload(
	assignedUnitsToSet: AssignedUnit[],
	assignedAlertGroupsToSet: AssignedAlertGroup[],
	payload: {
		assignedUnits: OperationMessageAssignedUnit[];
		assignedAlertGroups: OperationMessageAssignedAlertGroup[];
	},
): void {
	payload.assignedUnits = assignedUnitsToSet.map((unit) => ({
		unitId: unit.id,
		unitName: unit.name,
		unitSign: unit.callSign,
	}));
	payload.assignedAlertGroups = assignedAlertGroupsToSet.map((alertGroup) => ({
		alertGroupId: alertGroup.id,
		alertGroupName: alertGroup.name,
		assignedUnits: alertGroup.assignedUnits.map((unit) => ({
			unitId: unit.id,
			unitName: unit.name,
			unitSign: unit.callSign,
		})),
	}));
}

export function generateSearchableAssignmentsText(
	assignedUnits: AssignedUnit[],
	assignedAlertGroups: AssignedAlertGroup[],
): string {
	// we can just mix the assigned units and assigned alert groups units as in a search context their mapping to an alert group wont matter
	const unitsStr = [
		...assignedUnits,
		...assignedAlertGroups.flatMap((alertGroup) => alertGroup.assignedUnits),
	]
		.map((unit) => `${unit.name} (${unit.callSign})`)
		.join(', ');
	const alertGroupsStr = assignedAlertGroups
		.map((alertGroup) => alertGroup.name)
		.join(', ');
	return `einheiten ${unitsStr} alarm gruppen ${alertGroupsStr}`;
}
