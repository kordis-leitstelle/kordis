import { inject } from '@angular/core';
import { TypedDocumentNode } from 'apollo-angular';
import { Subject, map, shareReplay, startWith, switchMap } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

/*
 * This service handles the selection of entities in a context where an entity can only be selected once.
 * If an entity is selected, it will not be present in the possible entities list. It can be deselected to be visible again.
 */
export abstract class EntitySelectionService<
	TEntity extends { id: string },
	TQuery extends Record<string, TEntity[]>,
> {
	protected abstract query: TypedDocumentNode<TQuery>;
	protected abstract queryName: keyof TQuery;

	// Optional filter to apply on the entities that can be selected.
	protected filter?: (entity: TEntity) => boolean;

	private readonly entityIdsSelected = new Set<string>();
	private readonly gqlService = inject(GraphqlService);
	private readonly selectionChangedSubject$ = new Subject<void>();

	readonly allPossibleEntitiesToSelect$ = this.selectionChangedSubject$.pipe(
		startWith(null), // trigger initial query
		switchMap(() =>
			this.gqlService
				.queryOnce$<TQuery>(this.query) // query everytime and embrace the cache of the graphql service
				.pipe(
					map((data) => {
						return data[this.queryName].filter(
							(entity) =>
								!this.entityIdsSelected.has(entity.id) &&
								(this.filter ? this.filter(entity) : true),
						);
					}),
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

	resetSelections(): void {
		this.entityIdsSelected.clear();
		this.selectionChangedSubject$.next();
	}
}
