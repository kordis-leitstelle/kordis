import { gql } from '@kordis/spa/core/graphql';

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

export const GET_PROTOCOL_ENTRIES_QUERY = gql`
	${COMMUNICATION_FRAGMENT}
	${RESCUE_STATION_SIGN_ON_FRAGMENT}
	${RESCUE_STATION_UPDATE_FRAGMENT}
	${RESCUE_STATION_SIGN_OFF_FRAGMENT}
	query GetProtocolEntries($after: String, $before: String) {
		protocolEntries(first: 10, after: $after, before: $before) {
			pageInfo {
				hasNextPage
				hasPreviousPage
				startCursor
				endCursor
				totalEdges
			}
			edges {
				node {
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
				}
				cursor
			}
		}
	}
`;

export const CREATE_COMMUNICATION_MESSAGE = gql`
	mutation createCommunicationMessage(
		$sender: UnitInput!
		$recipient: UnitInput!
		$message: String!
		$channel: String!
	) {
		createCommunicationMessage(
			sender: $sender
			recipient: $recipient
			message: $message
			channel: $channel
		) {
			id
			orgId
			createdAt
			updatedAt
			time
			sender {
				... on UnknownUnit {
					name
				}
				... on RegisteredUnit {
					unit {
						name
						id
						callSign
					}
				}
			}
			searchableText
			producer {
				userId
				firstName
				lastName
			}
			recipient {
				... on UnknownUnit {
					name
				}
				... on RegisteredUnit {
					unit {
						name
						id
						callSign
					}
				}
			}
			channel
			payload {
				message
			}
		}
	}
`;
