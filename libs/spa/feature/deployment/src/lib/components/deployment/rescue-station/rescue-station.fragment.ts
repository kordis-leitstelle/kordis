import { gql } from '@kordis/spa/core/graphql';

export const UNIT_FRAGMENT = gql`
	fragment UnitData on Unit {
		id
		callSign
		callSignAbbreviation
		name
		note
		status {
			status
			receivedAt
		}
	}
`;

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
		assignments {
			... on DeploymentUnit {
				unit {
					...UnitData
				}
			}
			... on DeploymentAlertGroup {
				assignedUnits {
					unit {
						...UnitData
					}
				}
				alertGroup {
					id
					name
				}
			}
		}
	}
`;
