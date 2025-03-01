import { map, Observable, tap } from 'rxjs';

import {
	CommunicationMessage,
	MutationCreateCommunicationMessageArgs,
	ProtocolEntryUnion,
	Query,
} from '@kordis/shared/model';
import { gql, GraphqlService, QueryReturnType } from '@kordis/spa/core/graphql';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CREATE_COMMUNICATION_MESSAGE, GET_PROTOCOL_ENTRIES_QUERY } from './protocol.query';

import './cache-policies';
import { Injectable } from '@angular/core';

@Injectable()
export class ProtocolClient {
	readonly protocolEntries$: Observable<ProtocolEntryUnion[]>;
	private startCursor: string | null = null;
	private endCursor: string | null = null;

	private readonly query: QueryReturnType<{
		protocolEntries: Query['protocolEntries'];
	}>;

	constructor(private readonly gqlService: GraphqlService) {
		this.query = gqlService.query(GET_PROTOCOL_ENTRIES_QUERY, {
			after: null,
			before: null,
		});


		this.protocolEntries$ = this.query.$.pipe(
			tap((page) => {
				this.endCursor = page.protocolEntries.pageInfo.endCursor ?? null;
				this.startCursor = page.protocolEntries.pageInfo.startCursor ?? null;
			}),
			map((page) => page.protocolEntries.edges.map((edge) => edge.node)),
		);

		this.gqlService.subscribe$(gql`
			subscription {
				protocolEntryCreated {
					__typename
				}
			}
		`)
		.pipe(takeUntilDestroyed())
		.subscribe(() => 	this.loadNew());
	}

	loadNew(): void {
		this.query.fetchMore({
			variables: {
				before: this.startCursor,
			},
		});
	}

	loadNextPage(): void {
		this.query.fetchMore({
			variables: {
				after: this.endCursor,
			},
		});
	}

	addMessageAsync(args: MutationCreateCommunicationMessageArgs): void{
		this.gqlService
			.mutate$<CommunicationMessage>(CREATE_COMMUNICATION_MESSAGE, args)
			.subscribe();
	}
}
