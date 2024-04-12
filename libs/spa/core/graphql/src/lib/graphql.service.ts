import { Injectable } from '@angular/core';
import { DocumentNode } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { GraphQLError } from 'graphql';
import { Observable, map } from 'rxjs';

export interface GraphqlQueryResult<TData> {
	data: TData;
	errors?: ReadonlyArray<GraphQLError>;
}

export interface GraphqlMutationResult<TData> {
	data?: TData | null;
	errors?: ReadonlyArray<GraphQLError>;
	extensions?: Record<string, unknown>;
}

export interface GraphqlSubscriptionResult<TData> {
	data?: TData | null;
	errors?: ReadonlyArray<GraphQLError>;
	extensions?: Record<string, unknown>;
}

@Injectable({
	providedIn: 'root',
})
export class GraphqlService {
	constructor(private readonly apollo: Apollo) {}

	queryOnce$<TData = unknown>(
		query: DocumentNode,
		variables: Record<string, unknown>,
	): Observable<GraphqlQueryResult<TData>> {
		return this.apollo
			.query<TData>({
				query,
				variables,
			})
			.pipe(
				map(({ data, errors }) => ({
					data,
					errors,
				})),
			);
	}

	query<TData = unknown>(
		query: DocumentNode,
		variables: Record<string, unknown>,
	): {
		$: Observable<GraphqlQueryResult<TData>>;
		refresh: (
			variables: Record<string, unknown>,
		) => Promise<GraphqlQueryResult<TData>>;
	} {
		const queryRef = this.apollo.watchQuery<TData>({
			query,
			variables,
		});

		return {
			$: queryRef.valueChanges.pipe(
				map(({ data, errors }) => ({
					data,
					errors,
				})),
			),
			refresh: (
				variables: Record<string, unknown>,
			): Promise<GraphqlQueryResult<TData>> =>
				queryRef.refetch(variables).then(({ data, errors }) => ({
					data,
					errors,
				})),
		};
	}

	mutate$<TData = unknown>(
		mutation: DocumentNode,
		variables: Record<string, unknown>,
		optimisticResponse?: TData,
	): Observable<GraphqlMutationResult<TData>> {
		return this.apollo
			.mutate<TData>({
				mutation,
				variables,
				optimisticResponse: optimisticResponse
					? { __typename: 'Mutation', ...optimisticResponse }
					: undefined,
			})
			.pipe(
				map(({ data, errors, extensions }) => ({
					data,
					errors,
					extensions,
				})),
			);
	}

	subscribe$<TData = unknown>(
		query: DocumentNode,
		variables?: Record<string, unknown>,
	): Observable<GraphqlSubscriptionResult<TData>> {
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
			.pipe(
				map(({ data, errors, extensions }) => ({
					data,
					errors,
					extensions,
				})),
			);
	}
}
