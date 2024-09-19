import { inject } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';
import { Subject, map, shareReplay, startWith, switchMap } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { EntitySearchService } from '../../../../services/entity-search.service';

/*
 * This service handles the selection of entities in a context where an entity can only be selected once.
 * If a entity is selected, it will not be visible in the search results anymore. It can be deselected to be visible again.
 */
export abstract class EntitySelectionSearchService<
	TEntity extends { id: string },
	TQuery extends Record<string, TEntity[]>,
> {
	protected abstract query: TypedDocumentNode<TQuery>;
	protected abstract queryName: keyof TQuery;
	protected abstract searchService: EntitySearchService<TEntity>;

	private readonly entityIdsSelected = new Set<string>();
	private readonly gqlService = inject(GraphqlService);
	private readonly selectionChangedSubject$ = new Subject<void>();
	readonly allPossibleEntitiesToSelect$ = this.selectionChangedSubject$.pipe(
		startWith(null), // trigger initial query
		switchMap(() =>
			this.gqlService
				.queryOnce$<TQuery>(this.query)
				.pipe(
					map((data) =>
						data[this.queryName].filter(
							({ id }) => !this.entityIdsSelected.has(id),
						),
					),
				),
		),
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

	async searchAllPossibilities(query: string): Promise<TEntity[]> {
		const entities = await this.searchService.searchByTerm(query);
		return entities.filter(({ id }) => !this.entityIdsSelected.has(id));
	}
}
