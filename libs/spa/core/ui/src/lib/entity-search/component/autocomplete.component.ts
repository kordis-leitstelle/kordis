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

interface CustomValueOption {
	readonly [customValueSymbol: symbol]: string;
}

type ResultItem<T> = T | CustomValueOption;

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
			@for (option of result$ | async; track getOptionId(option)) {
				<nz-auto-option [nzValue]="option" [nzLabel]="getOptionLabel(option)">
					@if (isCustomValueOption(option)) {
						<span>"{{ getCustomValue(option) }}"</span>
					} @else {
						<ng-container *ngIf="optionTemplate as tRef; else defaultOption">
							<ng-container
								*ngTemplateOutlet="tRef; context: { $implicit: option }"
							></ng-container>
						</ng-container>
						<ng-template #defaultOption>
							<span>{{ labelFn()(option) }}</span>
						</ng-template>
					}
				</nz-auto-option>
			}
		</nz-autocomplete>
	`,
})
export class AutocompleteComponent<
	T extends object,
> extends ControlValueAccessorBase<T | string> {
	readonly labelFn = input.required<(value: T) => string>();
	readonly options = input<T[]>([]);
	readonly searchFields = input<StringKey<T>[]>([]);
	readonly placeholder = input<string>('');
	readonly allowCustomValues = input<boolean>(false);

	private readonly searchInputSubject$ = new BehaviorSubject<string>('');
	public readonly searchInput$ = this.searchInputSubject$.asObservable();

	private readonly searchInputFocusedSubject$ = new Subject<void>();
	private readonly lastSelectedEntitySubject$ = new BehaviorSubject<
		T | string | null
	>(null);

	// Custom value symbol for type safety when handling custom inputs
	private readonly CUSTOM_VALUE = Symbol('CUSTOM_VALUE');

	// Type to represent a custom value option that contains the input string
	private readonly customValueOption = (value: string): CustomValueOption => ({
		[this.CUSTOM_VALUE]: value,
	});

	readonly result$ = merge(
		// show all options if the search input is empty
		combineLatest([
			this.searchInputSubject$,
			this.searchInputFocusedSubject$,
		]).pipe(
			filter(([searchInput]) => searchInput.trim() === ''),
			map(() => this.options()),
		),
		// else show options based on the search input
		this.searchInputSubject$.pipe(
			filter(
				(searchInput): searchInput is string => typeof searchInput === 'string',
			),
			filter((searchInput) => searchInput.trim() !== ''),
			debounceTime(300),
			map((searchInput) => {
				const filteredOptions = this.filterOptions(this.options(), searchInput);

				if (!this.allowCustomValues()) {
					return filteredOptions as ResultItem<T>[];
				}

				// Add custom value option if enabled and no perfect match exists
				const hasPerfectMatch = this.hasPerfectMatch(
					filteredOptions,
					searchInput,
				);

				if (hasPerfectMatch) {
					return filteredOptions as ResultItem<T>[];
				}

				// Add the custom value as the first option
				return [
					this.customValueOption(searchInput),
					...filteredOptions,
				] as ResultItem<T>[];
			}),
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

	/**
	 * Check if an option is a custom value
	 */
	isCustomValueOption(option: ResultItem<T>): option is CustomValueOption {
		return option && this.CUSTOM_VALUE in option;
	}

	/**
	 * Extract the custom string value from a custom value option
	 */
	getCustomValue(option: CustomValueOption): string {
		return option[this.CUSTOM_VALUE];
	}

	/**
	 * Get appropriate label for display based on option type
	 */
	getOptionLabel(option: ResultItem<T>): string {
		if (this.isCustomValueOption(option)) {
			return this.getCustomValue(option);
		}
		return this.labelFn()(option);
	}

	/**
	 * Generate a unique ID for tracking options
	 */
	getOptionId(option: ResultItem<T>): string {
		if (this.isCustomValueOption(option)) {
			return `custom:${this.getCustomValue(option)}`;
		}
		return this.labelFn()(option);
	}

	/**
	 * Checks if there's a perfect match for the search input in the options
	 */
	hasPerfectMatch(options: T[], searchInput: string): boolean {
		const lowerSearchInput = searchInput.toLocaleLowerCase();

		return options.some((option) => {
			if (this.searchFields().length === 0) {
				return this.labelFn()(option).toLocaleLowerCase() === lowerSearchInput;
			} else {
				return this.searchFields().some(
					(field) =>
						(option[field] as string).toLocaleLowerCase() === lowerSearchInput,
				);
			}
		});
	}

	search(query: string): void {
		this.lastSelectedEntitySubject$.next(null);
		this.searchInputSubject$.next(query);
	}

	onSelect({ nzValue: nextValue }: NzAutocompleteOptionComponent): void {
		if (this.isCustomValueOption(nextValue as ResultItem<T>)) {
			// Handle custom value selection
			const customValue = this.getCustomValue(nextValue as CustomValueOption);
			this.lastSelectedEntitySubject$.next(customValue);
			this.searchInputSubject$.next(customValue);
		} else {
			// Handle regular option selection
			this.lastSelectedEntitySubject$.next(nextValue as T);
			this.searchInputSubject$.next(this.labelFn()(nextValue as T));
		}
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
			const perfectMatches = this.findMatchingOptions(currentSearchInput, true);

			// If there is a perfect match, select it
			if (perfectMatches.length > 0) {
				const perfectMatch = perfectMatches[0];
				this.lastSelectedEntitySubject$.next(perfectMatch);
				this.searchInputSubject$.next(this.labelFn()(perfectMatch));
			}
			// If custom values are allowed and there's no perfect match, use the input as value
			else if (this.allowCustomValues() && currentSearchInput.trim() !== '') {
				this.lastSelectedEntitySubject$.next(currentSearchInput);
				this.searchInputSubject$.next(currentSearchInput);
			}
		}

		this.onTouch();
	}

	// we cannot use the value signal from the base class because
	// signals don't emit when the value is set to null
	override writeValue(value: T | string | null): void {
		if (!value) {
			this.lastSelectedEntitySubject$.next(null);
			this.searchInputSubject$.next('');
		} else if (typeof value === 'string') {
			this.lastSelectedEntitySubject$.next(value);
			this.searchInputSubject$.next(value);
		} else {
			this.lastSelectedEntitySubject$.next(value);
			this.searchInputSubject$.next(this.labelFn()(value));
		}
	}

	/**
	 * Unified method to find options matching the search input
	 * @param searchInput The search input to match against
	 * @param exactMatch Whether to require an exact match (true) or partial match (false)
	 * @param options Optional list of options to search through, defaults to all options
	 * @returns Array of matching options
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

		// Simply sort alphabetically by label
		if (!exactMatch && matchedOptions.length > 1) {
			return matchedOptions.sort((a, b) =>
				this.labelFn()(a).localeCompare(this.labelFn()(b)),
			);
		}

		return matchedOptions;
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
