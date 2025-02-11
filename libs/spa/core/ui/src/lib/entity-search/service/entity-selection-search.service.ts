import { inject } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';
import {
	Observable,
	Subject,
	map,
	shareReplay,
	startWith,
	switchMap,
	tap,
} from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { IEntitySearchEngine } from './entity-search.service';

export interface EntitySearchService<TEntity> {
	allPossibleEntitiesToSelect$: Observable<TEntity[]>;
	searchAllPossibilities(query: string): Promise<TEntity[]>;
}
/*
 * This service handles the selection of entities in a context where an entity can only be selected once.
 * If a entity is selected, it will not be visible in the search results anymore. It can be deselected to be visible again.
 */
export abstract class EntitySelectionSearchService<
	TEntity extends { id: string },
	TQuery extends Record<string, TEntity[]>,
> implements EntitySearchService<TEntity>
{
	protected abstract query: TypedDocumentNode<TQuery>;
	protected abstract queryName: keyof TQuery;
	protected abstract searchService: IEntitySearchEngine<TEntity>;

	private readonly entityIdsSelected = new Set<string>();
	private readonly gqlService = inject(GraphqlService);
	private readonly selectionChangedSubject$ = new Subject<void>();

	readonly allPossibleEntitiesToSelect$ = this.selectionChangedSubject$.pipe(
		startWith(null), // trigger initial query
		switchMap(() =>
			this.gqlService
				.queryOnce$<TQuery>(this.query) // query everytime and embrace the cache of the graphql service
				.pipe(
					map((data) =>
						data[this.queryName].filter(
							({ id }) => !this.entityIdsSelected.has(id),
						),
					),
				),
		),
		tap((entities) => this.searchService.setSearchableEntities(entities)),
		shareReplay({ bufferSize: 1, refCount: true }),
	);

	// Mark entity as selected, it cannot be selected again, so it will not be visible in the search results
	markAsSelected(entity: TEntity): void {
		this.entityIdsSelected.add(entity.id);
		this.selectionChangedSubject$.next();
	}

	// Remove entity from selection, it will be visible in the search results again
	unmarkAsSelected(entity: TEntity): void {
		this.entityIdsSelected.delete(entity.id);
		this.selectionChangedSubject$.next();
	}

	isSelected(entity: TEntity): boolean {
		return this.entityIdsSelected.has(entity.id);
	}

	resetSelections(): void {
		this.entityIdsSelected.clear();
		this.selectionChangedSubject$.next();
	}

	async searchAllPossibilities(query: string): Promise<TEntity[]> {
		const entities = this.searchService.search(query);
		return entities.filter(({ id }) => !this.entityIdsSelected.has(id));
	}
}
