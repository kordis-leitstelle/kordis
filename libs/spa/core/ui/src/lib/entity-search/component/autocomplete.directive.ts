import { Directive } from '@angular/core';
import { NzAutocompleteOptionComponent } from 'ng-zorro-antd/auto-complete';
import { Subject, debounceTime, filter, merge, switchMap } from 'rxjs';

import { ControlValueAccessorBase } from '@kordis/spa/core/misc';

import { EntitySearchService } from '../service/entity-selection-search.service';

@Directive()
export abstract class AutocompleteComponent<
	T,
> extends ControlValueAccessorBase<T> {
	private readonly searchInputSubject$ = new Subject<string>();
	public readonly searchInput$ = this.searchInputSubject$.asObservable();
	private readonly searchInputFocusedSubject$ = new Subject<void>();
	readonly result$ = merge(
		merge(
			this.searchInputFocusedSubject$,
			this.searchInputSubject$.pipe(filter((value) => value === '')),
		).pipe(
			switchMap(() => this.selectionsService.allPossibleEntitiesToSelect$),
		),
		this.searchInputSubject$.pipe(
			filter((value): value is string => typeof value === 'string'),
			debounceTime(300),
			switchMap((value) => {
				return value
					? this.selectionsService.searchAllPossibilities(value)
					: [];
			}),
		),
	);

	protected constructor(
		private readonly selectionsService: EntitySearchService<T>,
		private readonly labelFn: (value: T) => string,
	) {
		super();
	}

	search(query: string): void {
		this.searchInputSubject$.next(query);
	}

	onSelect({ nzValue: nextValue }: NzAutocompleteOptionComponent): void {
		this.searchInputSubject$.next(this.labelFn(nextValue));
		this.onChange(nextValue);
	}

	onSearchInputFocus(): void {
		this.searchInputFocusedSubject$.next();
	}

	// we cannot use the value signal from the base class because
	// signals don't emit when the value is set to null
	override writeValue(value: T | null): void {
		if (value) {
			this.searchInputSubject$.next(this.labelFn(value));
		} else {
			this.searchInputSubject$.next('');
		}
	}
}
