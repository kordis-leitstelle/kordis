import { gql } from '@kordis/spa/core/graphql';

import { UNIT_FRAGMENT } from '../fragments';

export const RESCUE_STATION_FRAGMENT = gql`
	${UNIT_FRAGMENT}
	fragment RescueStationData on RescueStationDeployment {
		id
		name
		note
		signedIn
		defaultUnits {
			...UnitData
		}
		strength {
			helpers
			subLeaders
			leaders
		}
	}
`;
