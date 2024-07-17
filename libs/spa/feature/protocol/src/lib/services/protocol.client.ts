import { Observable, map, scan, tap } from 'rxjs';

import { PageInfo, ProtocolEntryUnion, Query } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

const GET_PROTOCOL_ENTRIES_QUERY = gql`
	query GetProtocolEntries($endCursor: String) {
		protocolEntries(first: 2, after: $endCursor) {
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
					... on RescueStationSignOnMessage {
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
					... on RescueStationUpdateMessage {
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
					... on RescueStationSignOffMessage {
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
				}
				cursor
			}
		}
	}
`;

export class ProtocolClient {
	private query;
	private pageInfo?: PageInfo;
	protocolEntries$: Observable<ProtocolEntryUnion[]>;

	constructor(readonly gqlService: GraphqlService) {
		this.query = gqlService.query<{
			protocolEntries: Query['protocolEntries'];
		}>(GET_PROTOCOL_ENTRIES_QUERY, { endCursor: null });

		this.protocolEntries$ = this.query.$.pipe(
			tap((page) => (this.pageInfo = page.protocolEntries.pageInfo)),
			map((page) => page.protocolEntries.edges.map((edge) => edge.node)),
			scan((acc, cur) => [...acc, ...cur]),
		);
	}

	loadMore(): void {
		this.query.refresh({ endCursor: this.pageInfo?.endCursor });
	}

	hasMore(): boolean {
		return this.pageInfo?.hasNextPage ?? false;
	}
}
