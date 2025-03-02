import { Directive, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NzAutocompleteOptionComponent } from 'ng-zorro-antd/auto-complete';
import { Subject, debounceTime, filter, merge, share, switchMap } from 'rxjs';

import { EntitySearchService } from '../service/entity-selection-search.service';

@Directive()
export abstract class AutocompleteComponent<T> {
	readonly searchInput = new FormControl<string | T>('');
	private readonly selectionSubject$ = new Subject<T>();
	// eslint-disable-next-line rxjs/finnish
	@Output() readonly selected = this.selectionSubject$.pipe(share());
	private readonly searchInputFocusedSubject$ = new Subject<void>();
	readonly result$ = merge(
		merge(
			this.searchInputFocusedSubject$,
			this.searchInput.valueChanges.pipe(filter((value) => value === '')),
		).pipe(
			switchMap(() => this.selectionsService.allPossibleEntitiesToSelect$),
		),
		this.searchInput.valueChanges.pipe(
			filter((value): value is string => typeof value === 'string'),
			debounceTime(300),
			switchMap((value) =>
				value ? this.selectionsService.searchAllPossibilities(value) : [],
			),
		),
	);

	protected constructor(
		private readonly selectionsService: EntitySearchService<T>,
	) {}

	onSelect({ nzValue: unit }: NzAutocompleteOptionComponent): void {
		this.selectionSubject$.next(unit);
		this.searchInput.reset();
	}

	onSearchInputFocus(): void {
		this.searchInputFocusedSubject$.next();
	}
}
