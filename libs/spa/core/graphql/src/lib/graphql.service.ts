import { Injectable } from '@angular/core';
import { DocumentNode } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class GraphqlService {
	constructor(private readonly apollo: Apollo) {}

	queryOnce$<TData = unknown>(
		query: DocumentNode,
		variables?: Record<string, unknown>,
	): Observable<TData> {
		return this.apollo
			.query<TData>({
				query,
				variables,
			})
			.pipe(map(({ data }) => data));
	}

	query<TData = unknown>(
		query: DocumentNode,
		variables?: Record<string, unknown>,
	): {
		$: Observable<TData>;
		refresh: (variables: Record<string, unknown>) => Promise<TData>;
	} {
		const queryRef = this.apollo.watchQuery<TData>({
			query,
			variables,
		});

		return {
			$: queryRef.valueChanges.pipe(map(({ data }) => data)),
			refresh: (variables: Record<string, unknown>): Promise<TData> =>
				queryRef.refetch(variables).then(({ data }) => data),
		};
	}

	mutate$<TData = unknown>(
		mutation: DocumentNode,
		variables?: Record<string, unknown>,
		optimisticResponse?: TData,
	): Observable<TData> {
		return this.apollo
			.mutate<TData>({
				mutation,
				variables,
				optimisticResponse: optimisticResponse
					? { __typename: 'Mutation', ...optimisticResponse }
					: undefined,
			})
			.pipe(map(({ data }) => data as TData));
	}

	subscribe$<TData = unknown>(
		query: DocumentNode,
		variables?: Record<string, unknown>,
	): Observable<TData> {
		return this.apollo
			.subscribe<TData>(
				{
					query,
					variables,
				},
				{
					useZone: false,
				},
			)
			.pipe(map(({ data }) => data as TData));
	}
}
