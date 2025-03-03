import { gql } from '../gql-tag';

const RESCUE_STATION_SIGN_ON_FRAGMENT = gql`
	fragment RescueStationSignOnMessageFragment on RescueStationSignOnMessage {
		id
		orgId
		createdAt
		updatedAt
		time
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
		searchableText
		producer {
			__typename
			userId
			firstName
			lastName
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
		id
		orgId
		createdAt
		updatedAt
		time
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
		searchableText
		producer {
			__typename
			userId
			firstName
			lastName
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
		__typename
		id
		orgId
		createdAt
		updatedAt
		time
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
		searchableText
		producer {
			__typename
			userId
			firstName
			lastName
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
		id
		orgId
		createdAt
		updatedAt
		time
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
		searchableText
		producer {
			__typename
			userId
			firstName
			lastName
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
		payload {
			__typename
			message
		}
	}
`;

export const PROTOCOL_ENTRY_FRAGMENTS = gql`
	${COMMUNICATION_FRAGMENT}
	${RESCUE_STATION_SIGN_ON_FRAGMENT}
	${RESCUE_STATION_UPDATE_FRAGMENT}
	${RESCUE_STATION_SIGN_OFF_FRAGMENT}
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
`;
