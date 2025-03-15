import {
	PROTOCOL_ENTRY_FRAGMENTS,
	PROTOCOL_ENTRY_FRAGMENTS_FIELDS,
	gql,
} from '@kordis/spa/core/graphql';

export const GET_PROTOCOL_ENTRIES_QUERY = gql`
	${PROTOCOL_ENTRY_FRAGMENTS}
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
					${PROTOCOL_ENTRY_FRAGMENTS_FIELDS}
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
