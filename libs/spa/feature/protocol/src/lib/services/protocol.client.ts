import { relayStylePagination } from '@apollo/client/utilities';
import { Observable, map } from 'rxjs';

import { ProtocolEntryUnion, Query } from '@kordis/shared/model';
import {
	GraphqlService,
	QueryReturnType,
	cache,
	gql,
} from '@kordis/spa/core/graphql';

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

const PROTOCOL_ENTRY_FRAGMENT = gql`
	${COMMUNICATION_FRAGMENT}
	${RESCUE_STATION_SIGN_ON_FRAGMENT}
	${RESCUE_STATION_UPDATE_FRAGMENT}
	${RESCUE_STATION_SIGN_OFF_FRAGMENT}
	fragment ProtocolEntryFragment on ProtocolEntryUnion {
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
`;

const GET_PROTOCOL_ENTRIES_QUERY = gql`
	${COMMUNICATION_FRAGMENT}
	${RESCUE_STATION_SIGN_ON_FRAGMENT}
	${RESCUE_STATION_UPDATE_FRAGMENT}
	${RESCUE_STATION_SIGN_OFF_FRAGMENT}
	query GetProtocolEntries($after: String, $before: String) {
		protocolEntries(first: 3, after: $after, before: $before) {
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

cache.policies.addTypePolicies({
	Query: {
		fields: {
			GetProtocolEntries: relayStylePagination(),
		},
	},
});

export class ProtocolClient {
	private query: QueryReturnType<{
		protocolEntries: Query['protocolEntries'];
	}>; // TODO: get return type from gqlService.query

	protocolEntries$: Observable<ProtocolEntryUnion[]>;
	cursor: string | null = null;

	constructor(readonly gqlService: GraphqlService) {
		this.query = gqlService.query(GET_PROTOCOL_ENTRIES_QUERY, {
			after: null,
			before: null,
		});

		this.protocolEntries$ = this.query.$.pipe(
			map((page) => {
				console.log('Page', page);
				this.cursor = page.protocolEntries.pageInfo.endCursor ?? null;
				return page.protocolEntries.edges.map((edge) => edge.node);
			}),
		);

		this.protocolEntries$.subscribe(console.log);

		this.loadInitialData();

		// this.gqlService
		// 	.subscribe$(gql`
		// 		subscription {
		// 			protocolEntryCreated {
		// 				__typename
		// 			}
		// 		}
		// 	`)
		// 	.pipe(takeUntilDestroyed())
		// 	.subscribe((entity) => {
		// 		console.log('New protocol entry created', entity);
		// 		this.query.refresh();
		// 	});
	}

	loadInitialData(): void {}

	loadLatest(): void {
		// TODO: fetch latest entries and prepend to the list
	}

	loadMore(): void {
		console.log('Load more');
		this.query.fetchMore({
			variables: {
				after: this.cursor,
			},
			// query: GET_PROTOCOL_ENTRIES_QUERY,
			// variables: {},
		});
	}

	// hasMore(): boolean {
	// 	// return this.pageInfo?.hasNextPage ?? false;
	// }
}
