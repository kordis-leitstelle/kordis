import { AlertGroup, DeploymentAssignment, Unit } from '@kordis/shared/model';

import {
	alertGroupMatchesByName,
	unitMatchesByNameOrCallSign,
	unitOrAlertGroupOfAssignmentMatches,
} from './match-strategies';

describe('unitMatchesByNameOrCallSign', () => {
	const unit = {
		name: 'Unit One',
		callSign: 'Alpha',
		callSignAbbreviation: 'A',
	} as Unit;

	it('should return true if the unit name matches the search term', () => {
		expect(unitMatchesByNameOrCallSign(unit, 'unit one')).toBe(true);
	});

	it('should return true if the call sign matches the search term', () => {
		expect(unitMatchesByNameOrCallSign(unit, 'alpha')).toBe(true);
	});

	it('should return true if the call sign abbreviation matches the search term', () => {
		expect(unitMatchesByNameOrCallSign(unit, 'a')).toBe(true);
	});

	it('should return false if no fields match the search term', () => {
		expect(unitMatchesByNameOrCallSign(unit, 'bravo')).toBe(false);
	});
});

describe('alertGroupMatchesByName', () => {
	const alertGroup = {
		name: 'Alert Group One',
	} as AlertGroup;

	it('should return true if the alert group name matches the search term', () => {
		expect(alertGroupMatchesByName(alertGroup, 'alert group one')).toBe(true);
	});

	it('should return false if the alert group name does not match the search term', () => {
		expect(alertGroupMatchesByName(alertGroup, 'alert group two')).toBe(false);
	});
});

describe('unitOrAlertGroupOfAssignmentMatches', () => {
	const unitAssignment = {
		__typename: 'DeploymentUnit',
		unit: {
			name: 'Unit One',
			callSign: 'Alpha',
			callSignAbbreviation: 'A',
		},
	} as DeploymentAssignment;

	const alertGroupAssignment = {
		__typename: 'DeploymentAlertGroup',
		alertGroup: {
			name: 'Alert Group One',
		},
		assignedUnits: [
			{
				unit: {
					name: 'Unit Two',
					callSign: 'Bravo',
					callSignAbbreviation: 'B',
				},
			},
		],
	} as DeploymentAssignment;

	it('should return true if the unit matches the search term', () => {
		expect(
			unitOrAlertGroupOfAssignmentMatches(unitAssignment, 'unit one'),
		).toBe(true);
	});

	it('should return true if the alert group matches the search term', () => {
		expect(
			unitOrAlertGroupOfAssignmentMatches(
				alertGroupAssignment,
				'alert group one',
			),
		).toBe(true);
	});

	it('should return true if any assigned unit matches the search term', () => {
		expect(
			unitOrAlertGroupOfAssignmentMatches(alertGroupAssignment, 'unit two'),
		).toBe(true);
	});

	it('should return false if no fields match the search term', () => {
		expect(unitOrAlertGroupOfAssignmentMatches(unitAssignment, 'bravo')).toBe(
			false,
		);
	});
});
