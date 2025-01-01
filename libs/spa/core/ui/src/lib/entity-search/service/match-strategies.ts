import { AlertGroup, DeploymentAssignment, Unit } from '@kordis/shared/model';

export function unitMatchesByNameOrCallSign(
	unit: Unit,
	searchTerm: string,
): boolean {
	const transformedSearchTerm = searchTerm.toLowerCase();
	return (
		unit.name.toLowerCase().includes(transformedSearchTerm) ||
		unit.callSign.toLowerCase().includes(transformedSearchTerm) ||
		unit.callSignAbbreviation.toLowerCase().includes(transformedSearchTerm)
	);
}

export function alertGroupMatchesByName(
	alertGroup: AlertGroup,
	searchTerm: string,
): boolean {
	return alertGroup.name.toLowerCase().includes(searchTerm.toLowerCase());
}

export function unitOrAlertGroupOfAssignmentMatches(
	assignment: DeploymentAssignment,
	searchTerm: string,
): boolean {
	const transformedSearchTerm = searchTerm.toLowerCase();
	switch (assignment.__typename) {
		case 'DeploymentUnit':
			return unitMatchesByNameOrCallSign(
				assignment.unit,
				transformedSearchTerm,
			);
		case 'DeploymentAlertGroup':
			return (
				alertGroupMatchesByName(assignment.alertGroup, transformedSearchTerm) ||
				assignment.assignedUnits.some(({ unit }) =>
					unitMatchesByNameOrCallSign(unit, transformedSearchTerm),
				)
			);
		default:
			return false;
	}
}
