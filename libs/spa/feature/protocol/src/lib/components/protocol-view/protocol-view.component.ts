import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

import {
	CommunicationMessage,
	MutationCreateCommunicationMessageArgs,
	ProtocolEntryUnion,
} from '@kordis/shared/model';
import { GraphqlService, cache, gql } from '@kordis/spa/core/graphql';

import { ProtocolClient } from '../../services/protocol.client';
import { CreateProtocolMessageComponent } from '../create-protocol-message/create-protocol-message.component';
import { ProtocolTableComponent } from '../protocol-table/protocol-table.component';

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

// TODO: move somewhere else
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
	imports: [
		CommonModule,
		ProtocolTableComponent,
		CreateProtocolMessageComponent,
	],
	template: ` <krd-create-protocol-message
			(newMessage)="addCommunicationMessage($event)"
		></krd-create-protocol-message>
		<krd-protocol [protocolEntries]="protocolEntries()" />`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolViewComponent {
	private client: ProtocolClient;
	private clientSubscription?: Subscription;

	protocolEntries: Signal<ProtocolEntryUnion[]>;

	constructor(private readonly gqlService: GraphqlService) {
		this.client = new ProtocolClient(gqlService);
		this.protocolEntries = toSignal(this.client.protocolEntries$, {
			initialValue: [],
		});
	}

	addCommunicationMessage(
		messageForm: MutationCreateCommunicationMessageArgs,
	): void {
		this.gqlService.mutate$<CommunicationMessage>(
			CREATE_COMMUNICATION_MESSAGE,
			messageForm,
		);
	}
}
