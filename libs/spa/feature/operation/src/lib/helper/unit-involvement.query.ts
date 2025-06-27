import { gql } from '@kordis/spa/core/graphql';

export const UNIT_INVOLVEMENTS_QUERY = gql`
	fragment UnitInvolvement on OperationUnitInvolvement {
		involvementTimes {
			start
			end
		}
		isPending
		unit {
			id
			callSign
			name
		}
	}
`;
