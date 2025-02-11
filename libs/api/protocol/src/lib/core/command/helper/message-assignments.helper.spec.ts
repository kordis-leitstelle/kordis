import {
	generateSearchableAssignmentsText,
	setAssignmentsOnPayload,
} from './message-assignments.helper';

describe('message-assignments.helper', () => {
	const mockUnits = [
		{ id: 'unit1', name: 'Unit 1', callSign: 'U1' },
		{ id: 'unit2', name: 'Unit 2', callSign: 'U2' },
	];

	const mockAlertGroups = [
		{
			id: 'alertGroup1',
			name: 'Alert Group 1',
			assignedUnits: [{ id: 'unit3', name: 'Unit 3', callSign: 'U3' }],
		},
		{
			id: 'alertGroup2',
			name: 'Alert Group 2',
			assignedUnits: [{ id: 'unit4', name: 'Unit 4', callSign: 'U4' }],
		},
	];

	describe('setAssignmentsOnPayload', () => {
		it('should correctly set assignedUnits and assignedAlertGroups on payload', () => {
			const payload = { assignedUnits: [], assignedAlertGroups: [] };
			setAssignmentsOnPayload(mockUnits, mockAlertGroups, payload);

			expect(payload).toEqual({
				assignedUnits: [
					{ unitId: 'unit1', unitName: 'Unit 1', unitSign: 'U1' },
					{ unitId: 'unit2', unitName: 'Unit 2', unitSign: 'U2' },
				],
				assignedAlertGroups: [
					{
						alertGroupId: 'alertGroup1',
						alertGroupName: 'Alert Group 1',
						assignedUnits: [
							{ unitId: 'unit3', unitName: 'Unit 3', unitSign: 'U3' },
						],
					},
					{
						alertGroupId: 'alertGroup2',
						alertGroupName: 'Alert Group 2',
						assignedUnits: [
							{ unitId: 'unit4', unitName: 'Unit 4', unitSign: 'U4' },
						],
					},
				],
			});
		});
	});

	describe('generateSearchableAssignmentsText', () => {
		it('should return a correctly formatted string for assigned units and alert groups', () => {
			const result = generateSearchableAssignmentsText(
				mockUnits,
				mockAlertGroups,
			);
			const expectedText =
				'einheiten Unit 1 (U1), Unit 2 (U2), Unit 3 (U3), Unit 4 (U4) alarm gruppen Alert Group 1, Alert Group 2';
			expect(result).toEqual(expectedText);
		});
	});
});
