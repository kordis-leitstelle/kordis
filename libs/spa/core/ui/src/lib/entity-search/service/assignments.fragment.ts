import { gql } from '@kordis/spa/core/graphql';

export const ASSIGNMENTS_FRAGMENT = gql`
	fragment Assignment on EntityAssignment {
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
	}
`;
