import { inject } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';
import MiniSearch from 'minisearch';
import { firstValueFrom, map } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

export interface EntitySearchService<TEntity> {
	searchByTerm(query: string): Promise<TEntity[]>;
}

export abstract class AbstractEntitySearchService<
	TEntity extends {
		id: string;
	},
	TQueryAll extends Record<string, TEntity[]>,
	TQueryOne extends Record<string, TEntity>,
> implements EntitySearchService<TEntity>
{
	private readonly gqlService = inject(GraphqlService);
	private readonly searchEngine: MiniSearch;

	protected constructor(
		getAllQuery: TypedDocumentNode<TQueryAll>,
		private readonly populateEntityQuery: TypedDocumentNode<TQueryOne>,
		queryAllName: keyof TQueryAll,
		private readonly queryOneName: keyof TQueryOne,
		searchFields: (keyof TEntity)[],
	) {
		this.searchEngine = new MiniSearch({
			fields: searchFields as string[],
		});
		// first index all entities with the necessary data to search
		this.gqlService
			.queryOnce$<TQueryAll>(getAllQuery)
			.pipe(map((res) => res[queryAllName]))
			.subscribe((entities) => this.searchEngine.addAll(entities));
	}

	searchByTerm(query: string): Promise<TEntity[]> {
		const res = this.searchEngine.search(query);

		// populate the entities to get the whole entity
		return Promise.all(res.map((sr) => this.getEntity(sr.id)));
	}

	private getEntity(id: string): Promise<TEntity> {
		return firstValueFrom(
			this.gqlService
				.queryOnce$<TQueryOne>(this.populateEntityQuery, { id })
				.pipe(map((res) => res[this.queryOneName])),
		);
	}
}
