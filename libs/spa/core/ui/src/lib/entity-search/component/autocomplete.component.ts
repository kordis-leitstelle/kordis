import { AsyncPipe, CommonModule } from '@angular/common';
import {
	Component,
	ContentChild,
	Directive,
	TemplateRef,
	forwardRef,
	input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import {
	NzAutocompleteModule,
	NzAutocompleteOptionComponent,
} from 'ng-zorro-antd/auto-complete';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {
	BehaviorSubject,
	Subject,
	combineLatest,
	debounceTime,
	distinctUntilChanged,
	filter,
	map,
	merge,
	take,
} from 'rxjs';

import { ControlValueAccessorBase } from '@kordis/spa/core/misc';

type StringKey<T> = {
	[K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

@Directive({
	selector: 'ng-template[krdOptionTemplate]',
	standalone: true,
})
export class OptionTemplateDirective<T> {
	readonly list = input.required<T[]>();

	constructor(public templateRef: TemplateRef<{ $implicit: T }>) {}

	static ngTemplateContextGuard<TContext>(
		dir: OptionTemplateDirective<TContext>,
		ctx: unknown,
	): ctx is { $implicit: TContext; list: TContext[] } {
		return true;
	}
}

@Component({
	selector: 'krd-autocomplete',
	imports: [
		AsyncPipe,
		CommonModule,
		NzAutocompleteModule,
		NzInputDirective,
		NzNoAnimationDirective,
		NzSelectModule,
		ReactiveFormsModule,
	],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AutocompleteComponent),
			multi: true,
		},
	],
	template: `
		<input
			#input
			(input)="search(input.value)"
			nz-input
			(focus)="onSearchInputFocus()"
			[nzAutocomplete]="auto"
			(blur)="onBlur()"
			[value]="searchInput$ | async"
			[disabled]="isDisabled()"
			[placeholder]="placeholder()"
		/>
		<nz-autocomplete
			(selectionChange)="onSelect($event)"
			[nzBackfill]="false"
			[nzNoAnimation]="true"
			#auto
		>
			@for (option of result$ | async; track labelFn()(option)) {
				<nz-auto-option [nzValue]="option" [nzLabel]="labelFn()(option)">
					<ng-container *ngIf="optionTemplate as tRef; else defaultOption">
						<ng-container
							*ngTemplateOutlet="tRef; context: { $implicit: option }"
						></ng-container>
					</ng-container>
					<ng-template #defaultOption>
						<span>{{ labelFn()(option) }}</span>
					</ng-template>
				</nz-auto-option>
			}
		</nz-autocomplete>
	`,
})
export class AutocompleteComponent<
	T extends object,
> extends ControlValueAccessorBase<T> {
	readonly labelFn = input.required<(value: T) => string>();
	readonly options = input<T[]>([]);
	readonly searchFields = input<StringKey<T>[]>([]);
	readonly placeholder = input<string>('');

	private readonly searchInputSubject$ = new BehaviorSubject<string>('');
	public readonly searchInput$ = this.searchInputSubject$.asObservable();

	private readonly searchInputFocusedSubject$ = new Subject<void>();
	private readonly lastSelectedEntitySubject$ = new BehaviorSubject<T | null>(
		null,
	);

	readonly result$ = merge(
		// show all options if the search input is empty
		combineLatest([
			this.searchInputSubject$,
			this.searchInputFocusedSubject$,
		]).pipe(
			filter(([searchInput]) => searchInput === ''),
			map(() => this.options()),
		),
		// else show options based on the search input
		this.searchInputSubject$.pipe(
			filter(
				(searchInput): searchInput is string => typeof searchInput === 'string',
			),
			filter((searchInput) => searchInput !== ''),
			debounceTime(300),
			map((searchInput) => this.filterOptions(this.options(), searchInput)),
		),
	);

	@ContentChild(OptionTemplateDirective)
	optionTemplateDir?: OptionTemplateDirective<T>;

	get optionTemplate(): TemplateRef<{ $implicit: T }> | undefined {
		return this.optionTemplateDir?.templateRef;
	}

	constructor() {
		super();

		this.lastSelectedEntitySubject$
			.pipe(takeUntilDestroyed(), distinctUntilChanged())
			.subscribe((selected) => {
				this.onChange(selected);
			});
	}

	search(query: string): void {
		this.lastSelectedEntitySubject$.next(null);
		this.searchInputSubject$.next(query);
	}

	onSelect({ nzValue: nextValue }: NzAutocompleteOptionComponent): void {
		this.lastSelectedEntitySubject$.next(nextValue);
		this.searchInputSubject$.next(this.labelFn()(nextValue));
	}

	onSearchInputFocus(): void {
		this.searchInputFocusedSubject$.next();
	}

	onBlur(): void {
		let currentSearchInput = '';

		// Get the latest value from the searchInput$ observable
		this.searchInput$.pipe(take(1)).subscribe((value) => {
			if (typeof value === 'string') {
				currentSearchInput = value;
			}
		});

		if (currentSearchInput) {
			const perfectMatch = this.findMatchingOptions(
				currentSearchInput,
				true,
			)[0];

			// if there is a perfect match, select it
			if (perfectMatch) {
				this.lastSelectedEntitySubject$.next(perfectMatch);
				this.searchInputSubject$.next(this.labelFn()(perfectMatch));
			}
		}

		this.onTouch();
	}

	// we cannot use the value signal from the base class because
	// signals don't emit when the value is set to null
	override writeValue(value: T | null): void {
		if (value) {
			this.lastSelectedEntitySubject$.next(value);
			this.searchInputSubject$.next(this.labelFn()(value));
		} else {
			this.lastSelectedEntitySubject$.next(null);
			this.searchInputSubject$.next('');
		}
	}

	/**
	 * Unified method to find options matching the search input
	 * @param searchInput The search input to match against
	 * @param exactMatch Whether to require an exact match (true) or partial match (false)
	 * @param options Optional list of options to search through, defaults to all options
	 * @returns Array of matching options, sorted by label
	 */
	private findMatchingOptions(
		searchInput: string,
		exactMatch = false,
		options: T[] = this.options(),
	): T[] {
		const lowerSearchInput = searchInput.toLocaleLowerCase();
		let matchedOptions: T[];

		if (this.searchFields().length === 0) {
			// If no search fields specified, use only the labelFn
			matchedOptions = options.filter((option) => {
				const labelValue = this.labelFn()(option).toLocaleLowerCase();
				return exactMatch
					? labelValue === lowerSearchInput
					: labelValue.includes(lowerSearchInput);
			});
		} else {
			// Otherwise, check search fields
			matchedOptions = options.filter((option) =>
				this.searchFields().some((field) => {
					const value = (option[field] as string).toLocaleLowerCase();
					return exactMatch
						? value === lowerSearchInput
						: value.includes(lowerSearchInput);
				}),
			);
		}

		return matchedOptions.toSorted((a, b) =>
			this.labelFn()(a).localeCompare(this.labelFn()(b)),
		);
	}

	/**
	 * Find options matching the search input using partial matching
	 * @param options The options to filter
	 * @param searchInput The search input to filter by
	 * @returns The filtered and sorted options
	 */
	private filterOptions(options: T[], searchInput: string): T[] {
		return this.findMatchingOptions(searchInput, false, options);
	}
}
