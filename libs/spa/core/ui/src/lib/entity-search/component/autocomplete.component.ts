import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	Directive,
	ElementRef,
	TemplateRef,
	booleanAttribute,
	computed,
	contentChild,
	forwardRef,
	input,
	viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
	NzAutocompleteComponent,
	NzAutocompleteOptionComponent,
	NzAutocompleteTriggerDirective,
} from 'ng-zorro-antd/auto-complete';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { Subject, filter, map, merge } from 'rxjs';

import { ControlValueAccessorBase } from '@kordis/spa/core/misc';

@Directive({
	selector: '[krdAutocompleteOptionTmpl]',
})
export class AutocompleteOptionTemplateDirective<TContext> {
	// type token, so we get type hints for the context variable
	readonly list = input.required<TContext[]>();

	constructor(public templateRef: TemplateRef<{ $implicit: TContext }>) {}

	static ngTemplateContextGuard<TContext>(
		dir: AutocompleteOptionTemplateDirective<TContext>,
		ctx: unknown,
	): ctx is { $implicit: TContext; list: TContext[] } {
		return true;
	}
}

type StringKey<T> = {
	[K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

interface CustomValueOption {
	readonly [customValueSymbol: symbol]: string;
}

type ResultItem<T> = T | CustomValueOption;

@Component({
	selector: 'krd-autocomplete',
	template: `
		<input
			#input
			(input)="search(input.value)"
			nz-input
			(focus)="onSearchInputFocus()"
			[nzAutocomplete]="auto"
			(blur)="onBlur()"
			[value]="searchInput$ | async"
			[placeholder]="placeholder()"
			[disabled]="isDisabled()"
		/>
		<nz-autocomplete
			(selectionChange)="onSelect($event.nzValue)"
			[nzBackfill]="false"
			nzNoAnimation
			#auto
			[nzOverlayStyle]="dropdownStyle()"
		>
			@for (option of result$ | async; track getOptionId(option)) {
				<nz-auto-option [nzValue]="option" [nzLabel]="getOptionLabel(option)">
					@if (isCustomValueOption(option)) {
						<span>"{{ getCustomValue(option) }}"</span>
					} @else if (optionTemplateDir()) {
						<ng-container
							*ngTemplateOutlet="
								optionTemplate!;
								context: { $implicit: option }
							"
						/>

						<ng-template #defaultOption>
							<span>{{ labelFn()(option) }}</span>
						</ng-template>
					}
				</nz-auto-option>
			}
		</nz-autocomplete>
	`,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AutocompleteComponent),
			multi: true,
		},
	],
	imports: [
		AsyncPipe,
		NgTemplateOutlet,
		NzAutocompleteComponent,
		NzAutocompleteOptionComponent,
		NzAutocompleteTriggerDirective,
		NzInputDirective,
		NzNoAnimationDirective,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent<
	T extends object,
> extends ControlValueAccessorBase<T | string> {
	readonly options = input<T[]>([]);
	readonly dropdownWidth = input<number>();
	readonly dropdownStyle = computed(
		() =>
			(this.dropdownWidth()
				? { minWidth: `${this.dropdownWidth()}px` }
				: {}) as Record<string, string>,
	);
	readonly labelFn = input.required<(value: T) => string>();
	readonly searchFields = input<StringKey<T>[]>([]);
	readonly placeholder = input<string>('');
	readonly allowCustomValues = input(false, {
		transform: booleanAttribute,
	});
	readonly selectOnBlur = input(false, {
		transform: booleanAttribute,
	});
	readonly optionTemplateDir = contentChild<
		AutocompleteOptionTemplateDirective<T>
	>(AutocompleteOptionTemplateDirective);
	get optionTemplate(): TemplateRef<{ $implicit: T }> | undefined {
		return this.optionTemplateDir()?.templateRef;
	}

	private readonly searchInputSubject$ = new Subject<string>();
	readonly searchInput$ = this.searchInputSubject$.asObservable();
	private readonly searchInputFocusedSubject$ = new Subject<void>();

	private readonly autocompleteComponent = viewChild(NzAutocompleteComponent);
	private readonly inputEle = viewChild<ElementRef>('input');

	// Custom value symbol for type safety when handling custom inputs
	private readonly CUSTOM_VALUE = Symbol('CUSTOM_VALUE');
	// Type to represent a custom value option that contains the input string
	private readonly customValueOption = (value: string): CustomValueOption => ({
		[this.CUSTOM_VALUE]: value,
	});

	readonly result$ = merge(
		merge(
			this.searchInputFocusedSubject$,
			this.searchInputSubject$.pipe(filter((value) => value.trim() === '')),
		).pipe(map(() => this.options())),
		this.searchInputSubject$.pipe(
			filter((searchInput) => searchInput.trim() !== ''),
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
					...filteredOptions,
					this.customValueOption(searchInput),
				] as ResultItem<T>[];
			}),
		),
	);

	search(query: string): void {
		this.searchInputSubject$.next(query);
	}

	onSelect(nextValue: ResultItem<T>): void {
		let valueToSet: string | T;
		if (this.isCustomValueOption(nextValue)) {
			// Handle custom value selection
			const customValue = this.getCustomValue(nextValue);
			this.searchInputSubject$.next(customValue);
			valueToSet = customValue;
		} else {
			// Handle regular option selection
			this.searchInputSubject$.next(this.labelFn()(nextValue));
			valueToSet = nextValue;
		}
		this.onChange(valueToSet);
		this.value.set(valueToSet);
	}

	onSearchInputFocus(): void {
		this.searchInputFocusedSubject$.next();
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
	 * Get the appropriate label for display based on option type
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

	onBlur(): void {
		if (this.selectOnBlur()) {
			// on leaving, select the last active option (e.g. on tab)
			const activeOption = this.autocompleteComponent()?.activeItem;
			this.onSelect(activeOption?.nzValue);
		}
		this.onTouch();
	}

	focus(): void {
		this.inputEle()?.nativeElement.focus();
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

	override writeValue(value: T | null): void {
		this.value.set(value);
		if (value) {
			this.searchInputSubject$.next(this.labelFn()(value));
		} else {
			this.searchInputSubject$.next('');
		}
	}
}
