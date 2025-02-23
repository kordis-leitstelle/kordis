import { gql } from '@kordis/spa/core/graphql';

const ASSIGNMENT_QUERY_FIELDS = `
		... on DeploymentUnit {
			unit {
				...UnitData
			}
		}
		... on DeploymentAlertGroup {
			alertGroup {
				id
				name
			}
			assignedUnits {
				unit {
					...UnitData
				}
			}
		}`;

const UNIT_FRAGMENT = gql`
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

const RESCUE_STATION_FRAGMENT = gql`
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
			${ASSIGNMENT_QUERY_FIELDS}
		}
	}
`;

export const DEPLOYMENTS_QUERY = gql`
	${RESCUE_STATION_FRAGMENT}
	query {
		signedInStations: rescueStationDeployments(signedIn: true) {
			...RescueStationData
		}
		signedOffStations: rescueStationDeployments(signedIn: false) {
			...RescueStationData
		}
		unassignedEntities {
			${ASSIGNMENT_QUERY_FIELDS}
		}
		operationDeployments {
			operation {
				id
				sign
				alarmKeyword
				location {
					address {
						name
						street
					}
				}
			}
			assignments {
				${ASSIGNMENT_QUERY_FIELDS}
			}
		}
	}
`;
