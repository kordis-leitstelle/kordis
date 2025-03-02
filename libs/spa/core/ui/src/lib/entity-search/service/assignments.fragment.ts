export const ASSIGNMENTS_FIELDS = `
		__typename
		... on EntityOperationAssignment {
			operation {
				alarmKeyword
				sign
			}
		}
		... on EntityRescueStationAssignment {
			id
			name
		}
`;
