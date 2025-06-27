import { gql } from '../gql-tag';

const DEFAULT_FIELDS = `
		id
		orgId
		createdAt
		updatedAt
		time
		communicationDetails {
			sender {
				__typename
				... on RegisteredUnit {
					unit {
						__typename
						id
						name
						callSign
					}
				}
				... on UnknownUnit {
					name
				}
			}
			recipient {
				__typename
				... on RegisteredUnit {
					unit {
						__typename
						id
						name
						callSign
					}
				}
				... on UnknownUnit {
					name
				}
			}
			channel
		}
		searchableText
`;

const RESCUE_STATION_SIGN_ON_FRAGMENT = gql`
	fragment RescueStationSignOnMessageFragment on RescueStationSignOnMessage {
		${DEFAULT_FIELDS}
		producer {
			__typename
			... on SystemProducer {
				name
			}
		}
		payload {
			__typename
			rescueStationId
			rescueStationName
			rescueStationCallSign
			strength {
				__typename
				leaders
				subLeaders
				helpers
			}
			units {
				__typename
				id
				name
				callSign
			}
			alertGroups {
				__typename
				id
				name
				units {
					__typename
					id
					name
					callSign
				}
			}
		}
	}
`;

const RESCUE_STATION_UPDATE_FRAGMENT = gql`
	fragment RescueStationUpdateMessageFragment on RescueStationUpdateMessage {
		${DEFAULT_FIELDS}
		payload {
			__typename
			rescueStationId
			rescueStationName
			rescueStationCallSign
			strength {
				__typename
				leaders
				subLeaders
				helpers
			}
			units {
				__typename
				id
				name
				callSign
			}
			alertGroups {
				__typename
				id
				name
				units {
					__typename
					id
					name
					callSign
				}
			}
		}
	}
`;

const RESCUE_STATION_SIGN_OFF_FRAGMENT = gql`
	fragment RescueStationSignOffMessageFragment on RescueStationSignOffMessage {
		${DEFAULT_FIELDS}
		payload {
			__typename
			rescueStationId
			rescueStationName
			rescueStationCallSign
		}
	}
`;

const COMMUNICATION_FRAGMENT = gql`
	fragment CommunicationMessageFragment on CommunicationMessage {
		${DEFAULT_FIELDS}
		producer {
			__typename
			... on UserProducer {
				userId
				firstName
				lastName
			}
		}
		payload {
			__typename
			message
		}
	}
`;

const OPERATION_STARTED_FRAGMENT = gql`
	fragment OperationStartedMessageFragment on OperationStartedMessage {
		${DEFAULT_FIELDS}
		payload {
			__typename
			operationId
			operationSign
			alarmKeyword
			location {
				street
				name
			}
			assignedAlertGroups {
				alertGroupName
				assignedUnits {
					unitSign
					unitName
				}
			}
			assignedUnits {
				unitSign
				unitName
			}
		}
	}
`;

const OPERATION_INVOLVEMENTS_UPDATED_FRAGMENT = gql`
	fragment OperationInvolvementsUpdatedMessageFragment on OperationInvolvementsUpdatedMessage {
		${DEFAULT_FIELDS}
		payload {
			__typename
			operationId
			operationSign
			assignedAlertGroups {
				alertGroupName
				assignedUnits {
					unitSign
					unitName
				}
			}
			assignedUnits {
				unitSign
				unitName
			}
		}
	}
`;

const OPERATION_ENDED_FRAGMENT = gql`
	fragment OperationEndedMessageFragment on OperationEndedMessage {
		${DEFAULT_FIELDS}
		payload {
			__typename
			operationId
			operationSign
		}
	}
`;

export const PROTOCOL_ENTRY_FRAGMENTS = gql`
	${COMMUNICATION_FRAGMENT}
	${RESCUE_STATION_SIGN_ON_FRAGMENT}
	${RESCUE_STATION_UPDATE_FRAGMENT}
	${RESCUE_STATION_SIGN_OFF_FRAGMENT}
	${OPERATION_STARTED_FRAGMENT}
	${OPERATION_INVOLVEMENTS_UPDATED_FRAGMENT}
	${OPERATION_ENDED_FRAGMENT}
`;

export const PROTOCOL_ENTRY_FRAGMENTS_FIELDS = `
		__typename
		... on CommunicationMessage {
			...CommunicationMessageFragment
		}
		... on RescueStationSignOnMessage {
			...RescueStationSignOnMessageFragment
		}
		... on RescueStationUpdateMessage {
			...RescueStationUpdateMessageFragment
		}
		... on RescueStationSignOffMessage {
			...RescueStationSignOffMessageFragment
		}
		... on OperationStartedMessage {
			...OperationStartedMessageFragment
		}
		... on OperationInvolvementsUpdatedMessage {
			...OperationInvolvementsUpdatedMessageFragment
		}
		... on OperationEndedMessage {
			...OperationEndedMessageFragment
		}
`;
