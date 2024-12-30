import { AlertGroup, DeploymentAssignment, Unit } from '@kordis/shared/model';

export function unitMatchesByNameOrCallSign(
	unit: Unit,
	searchTerm: string,
): boolean {
	return (
		unit.name.toLowerCase().includes(searchTerm) ||
		unit.callSign.toLowerCase().includes(searchTerm) ||
		unit.callSignAbbreviation.toLowerCase().includes(searchTerm)
	);
}

export function alertGroupMatchesByName(
	alertGroup: AlertGroup,
	searchTerm: string,
): boolean {
	return alertGroup.name.toLowerCase().includes(searchTerm);
}

export function unitOrAlertGroupOfAssignmentMatches(
	assignment: DeploymentAssignment,
	searchTerm: string,
): boolean {
	switch (assignment.__typename) {
		case 'DeploymentUnit':
			return unitMatchesByNameOrCallSign(assignment.unit, searchTerm);
		case 'DeploymentAlertGroup':
			return (
				alertGroupMatchesByName(assignment.alertGroup, searchTerm) ||
				assignment.assignedUnits.some(({ unit }) =>
					unitMatchesByNameOrCallSign(unit, searchTerm),
				)
			);
		default:
			return false;
	}
}
