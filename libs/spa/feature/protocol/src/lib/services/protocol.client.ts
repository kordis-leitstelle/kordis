import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, map, tap } from 'rxjs';

import {
	CommunicationMessage,
	MutationCreateCommunicationMessageArgs,
	ProtocolEntryUnion,
	Query,
} from '@kordis/shared/model';
import { GraphqlService, QueryReturnType, gql } from '@kordis/spa/core/graphql';

import './cache-policies';
import {
	CREATE_COMMUNICATION_MESSAGE,
	GET_PROTOCOL_ENTRIES_QUERY,
} from './protocol.query';

@Injectable()
export class ProtocolClient {
	readonly protocolEntries$: Observable<ProtocolEntryUnion[]>;
	private startCursor: string | null = null;
	private endCursor: string | null = null;

	private readonly query: QueryReturnType<{
		protocolEntries: Query['protocolEntries'];
	}>;
	private readonly gqlService = inject(GraphqlService);
	constructor() {
		this.query = this.gqlService.query(GET_PROTOCOL_ENTRIES_QUERY, {
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

		this.gqlService
			.subscribe$(gql`
				subscription {
					protocolEntryCreated {
						__typename
					}
				}
			`)
			.pipe(takeUntilDestroyed())
			.subscribe(() => this.loadNew());
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

	addMessageAsync(args: MutationCreateCommunicationMessageArgs): void {
		this.gqlService
			.mutate$<CommunicationMessage>(CREATE_COMMUNICATION_MESSAGE, args)
			.subscribe();
	}
}
