import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { throwServerError } from '@apollo/client/core';
import { Observable, map, scan, share, tap } from 'rxjs';

import { PageInfo, ProtocolEntryUnion, Query } from '@kordis/shared/model';
import { GraphqlService, QueryReturnType, gql } from '@kordis/spa/core/graphql';

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
	query GetProtocolEntries($endCursor: String) {
		protocolEntries(first: 100, after: $endCursor) {
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

export class ProtocolClient {
	private query: QueryReturnType<{
		protocolEntries: Query['protocolEntries'];
	}>;
	private pageInfo?: PageInfo;
	protocolEntries$: Observable<ProtocolEntryUnion[]>;

	constructor(readonly gqlService: GraphqlService) {
		console.log(GET_PROTOCOL_ENTRIES_QUERY);

		this.query = gqlService.query(GET_PROTOCOL_ENTRIES_QUERY, {
			endCursor: null,
		});

		this.query.$.subscribe(console.log);

		this.protocolEntries$ = this.query.$.pipe(
			map((page) => page.protocolEntries),
			tap((page) => (this.pageInfo = page.pageInfo)),
			map((page) => page.edges.map((edge) => edge.node)),
			scan((acc, cur) => [...acc, ...cur]),
			share()
		);

		this.protocolEntries$.subscribe(console.log);

		this.gqlService
			.subscribe$(gql`
				subscription {
					protocolEntryCreated {
						__typename
					}
				}
			`)
			.pipe(takeUntilDestroyed())
			.subscribe(() => this.query.refresh()); 
	}

	loadLatest(): void {
		// TODO: fetch latest entries and prepend to the list
	}

	loadMore(): void {
		this.query.refresh({ endCursor: this.pageInfo?.endCursor });
	}

	hasMore(): boolean {
		return this.pageInfo?.hasNextPage ?? false;
	}
}
