import { Injectable, inject } from '@angular/core';
import { DocumentNode } from '@apollo/client/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export type QueryReturnType<TData> = {
	$: Observable<TData>;
	refresh: (variables?: Record<string, unknown>) => Promise<TData>;
} & Pick<QueryRef<TData, Record<string, unknown>>, 'fetchMore'>;

@Injectable({
	providedIn: 'root',
})
export class GraphqlService {
	private readonly apollo = inject(Apollo);

	queryOnce$<TData = unknown>(
		query: DocumentNode,
		variables: Record<string, unknown> = {},
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
		variables: Record<string, unknown> = {},
	): QueryReturnType<TData> {
		const queryRef = this.apollo.watchQuery<TData>({
			query,
			variables,
		});

		return {
			$: queryRef.valueChanges.pipe(map(({ data }) => data)),
			refresh: (variables?: Record<string, unknown>): Promise<TData> =>
				queryRef.refetch(variables).then(({ data }) => data),
			fetchMore: queryRef.fetchMore.bind(queryRef),
		};
	}

	mutate$<TData = unknown>(
		mutation: DocumentNode,
		variables?: Record<string, unknown>,
	): Observable<TData> {
		return this.apollo
			.mutate<TData>({
				mutation,
				variables,
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
