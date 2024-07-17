import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
	signal,
} from '@angular/core';
import { Subscription } from 'rxjs';

import {
	CommunicationMessage,
	ProtocolEntryUnion
} from '@kordis/shared/model';
import { GraphqlService, cache, gql } from '@kordis/spa/core/graphql';

import { ProtocolClient } from '../../services/protocol.client';
import { ProtocolComponent } from '../protocol/protocol.component';

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
			createdAt: {
				read(time: string) {
					return new Date(time);
				},
			},
			editedAt: {
				read(time: string) {
					return new Date(time);
				},
			},
		},
	},
	RescueStationSignOnMessage: {
		fields: {
			time: {
				read(time: string) {
					return new Date(time);
				},
			},
			createdAt: {
				read(time: string) {
					return new Date(time);
				},
			},
			editedAt: {
				read(time: string) {
					return new Date(time);
				},
			},
		},
	},
	RescueStationUpdateMessage: {
		fields: {
			time: {
				read(time: string) {
					return new Date(time);
				},
			},
			createdAt: {
				read(time: string) {
					return new Date(time);
				},
			},
			editedAt: {
				read(time: string) {
					return new Date(time);
				},
			},
		},
	},
	RescueStationSignOffMessage: {
		fields: {
			time: {
				read(time: string) {
					return new Date(time);
				},
			},
			createdAt: {
				read(time: string) {
					return new Date(time);
				},
			},
			editedAt: {
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
		<krd-protocol [protocolEntries]="protocolEntries()" />`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolViewComponent implements OnInit, OnDestroy {
	private client: ProtocolClient;
	private clientSubscription?: Subscription;

	protocolEntries = signal<ProtocolEntryUnion[]>([]);

	constructor(private readonly gqlService: GraphqlService) {
		this.client = new ProtocolClient(gqlService);
	}
	ngOnDestroy(): void {
		this.clientSubscription?.unsubscribe();
	}

	ngOnInit(): void {
		this.clientSubscription = this.client.protocolEntries$.subscribe((x) => {
			this.protocolEntries.set(x);
		});
	}

	loadMore(): void {
		if (!this.client.hasMore()) {
			console.log('No next page available');
			return;
		}

		this.client.loadMore();
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
