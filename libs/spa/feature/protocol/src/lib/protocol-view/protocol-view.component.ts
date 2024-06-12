import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { map, tap } from 'rxjs';

import {
	CommunicationMessage,
	PageInfo,
	ProtocolEntryUnion,
	Query,
} from '@kordis/shared/model';
import { GraphqlService, cache, gql } from '@kordis/spa/core/graphql';

import { ProtocolComponent } from '../protocol/protocol.component';

const GET_PROTOCOL_ENTRIES_QUERY = gql`
	query GetProtocolEntries($endCursor: String) {
		protocolEntries(first: 20, after: $endCursor) {
			pageInfo {
				hasNextPage
				hasPreviousPage
				startCursor
				endCursor
				totalEdges
			}
			edges {
				node {
					... on CommunicationMessage {
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
				cursor
			}
		}
	}
`;

const CREATE_COMMUNICATION_MESSAGE = gql`
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

cache.policies.addTypePolicies({
	CommunicationMessage: {
		fields: {
			time: {
				read(time: string) {
					return new Date(time);
				},
			},
		},
	},
});

@Component({
	selector: 'krd-protocol-view',
	standalone: true,
	imports: [CommonModule, ProtocolComponent],
	template: ` <button (click)="loadMore()">Load more</button>
		<button (click)="addCommunicationMessage()">Add Comm Message</button>
		<krd-protocol [protocolEntries]="protocolEntries" />`,
	styles: ``,
	//changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolViewComponent {
	private query;
	pageInfo?: PageInfo;
	protocolEntries: ProtocolEntryUnion[] = [];

	constructor(private readonly gqlService: GraphqlService) {
		this.query = gqlService.query<{
			protocolEntries: Query['protocolEntries'];
		}>(GET_PROTOCOL_ENTRIES_QUERY, { endCursor: null });

		this.query.$.pipe(
			tap((x) => console.log('fetched protocol entries', x)),
			tap((x) => (this.pageInfo = x.data.protocolEntries.pageInfo)),
			map((x) => x.data.protocolEntries.edges.map((edge) => edge.node)),
		)
			// TODO: unsubscribe on destroy
			.subscribe((x) => {
				this.protocolEntries = [...this.protocolEntries, ...x];
				console.log('data array', this.protocolEntries);
			});
	}

	loadMore(): void {
		if (!this.pageInfo?.hasNextPage) {
			console.log('No next page available');
			return;
		}

		console.log('loading more protocol entries');
		this.query.refresh({ endCursor: this.pageInfo?.endCursor ?? null });
	}

	addCommunicationMessage(): void {
		this.gqlService
			.mutate$<CommunicationMessage>(CREATE_COMMUNICATION_MESSAGE, {
				sender: {
					type: 'REGISTERED_UNIT',
					id: '65d7d90709cdb6f3b2082ab3',
				},
				recipient: {
					type: 'UNKNOWN_UNIT',
					name: 'Alice',
				},
				message: 'abcabcabcabc',
				channel: 'D',
			})
			.subscribe((x) => console.log('Created comm msg', x));
	}
}
