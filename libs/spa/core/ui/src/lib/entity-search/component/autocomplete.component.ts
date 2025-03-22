import { AsyncPipe, CommonModule } from '@angular/common';
import {
	Component,
	ContentChild,
	Directive,
	ElementRef,
	TemplateRef,
	booleanAttribute,
	forwardRef,
	input,
	output,
	signal,
	viewChild,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
	FormsModule,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule,
} from '@angular/forms';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Subject, combineLatest, debounceTime, filter, map, merge } from 'rxjs';

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

/*
	This component is for basic filtering of options as an autocomplete input field,
 */
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
		FormsModule,
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
			nz-input
			(focus)="onSearchInputFocus()"
			[nzAutocomplete]="auto"
			(blur)="onBlur()"
			[(ngModel)]="searchInputSignal"
			(ngModelChange)="onModelChange($event)"
			[disabled]="isDisabled()"
			[placeholder]="placeholder()"
		/>
		<nz-autocomplete [nzBackfill]="false" nzNoAnimation #auto>
			@for (option of filteredOptions$ | async; track getOptionId(option)) {
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
	searchInputSignal = signal('');
	onModelChange(value: any): void {
		console.log('onModelChange', value);

		if (typeof value === 'string') {
			this.onChange(value);
		} else if (value) {
			// if the result has the field present, set the value, otherwise reset the value
			if (this.isCustomValueOption(value as ResultItem<T>)) {
				// Handle custom value selection
				const customValue = this.getCustomValue(value as CustomValueOption);
				this.onChange(customValue);
			} else {
				// Handle regular option selection
				this.onChange(value);
			}
		} else {
			this.onChange('');
		}
	}

	readonly labelFn = input.required<(value: T) => string>();
	readonly options = input<T[]>([]);
	readonly searchFields = input<StringKey<T>[]>([]);
	readonly placeholder = input<string>('');
	readonly allowCustomValues = input(false, {
		transform: booleanAttribute,
	});
	readonly optionSelected = output<void>();

	private readonly searchInputFocusedSubject$ = new Subject<void>();

	// Custom value symbol for type safety when handling custom inputs
	private readonly CUSTOM_VALUE = Symbol('CUSTOM_VALUE');

	// Type to represent a custom value option that contains the input string
	private readonly customValueOption = (value: string): CustomValueOption => ({
		[this.CUSTOM_VALUE]: value,
	});

	private readonly inputEle = viewChild<ElementRef>('input');

	readonly filteredOptions$ = merge(
		// show all options if the search input is empty
		combineLatest([
			this.searchInputSignal(),
			this.searchInputFocusedSubject$,
		]).pipe(
			filter(([searchInput]) => searchInput.trim() === ''),
			map(() => this.options()),
		),
		// else show options based on the search input
		toObservable(this.searchInputSignal).pipe(
			filter(
				(searchInput: T | string): searchInput is string =>
					typeof searchInput === 'string',
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

				return [
					...filteredOptions,
					this.customValueOption(searchInput),
				] as ResultItem<T>[];
			}),
		),
	);

	@ContentChild(OptionTemplateDirective)
	optionTemplateDir?: OptionTemplateDirective<T>;

	get optionTemplate(): TemplateRef<{ $implicit: T }> | undefined {
		return this.optionTemplateDir?.templateRef;
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

	onSearchInputFocus(): void {
		this.searchInputFocusedSubject$.next();
		console.log('onsearch input focus');
	}

	onBlur(): void {
		console.log('on blur');
		if (
			this.searchInputSignal() &&
			typeof this.searchInputSignal() === 'string'
		) {
			const perfectMatches = this.findMatchingOptions(
				this.searchInputSignal(),
				true,
			);

			// If there is a perfect match, select it
			if (perfectMatches.length > 0) {
				const perfectMatch = perfectMatches[0];
				this.searchInputSubject$.next(this.labelFn()(perfectMatch));
			}
			// If custom values are allowed and there's no perfect match, use the input as value
			else if (
				this.allowCustomValues() &&
				this.searchInputSignal().trim() !== ''
			) {
				this.searchInputSubject$.next(this.searchInputSignal());
			}
		}
		this.onTouch();
		console.log('on blur end');
	}

	focus(): void {
		this.inputEle()?.nativeElement.focus();
		//setTimeout(() => this.inputEle()?.nativeElement.focus());
	}

	// we cannot use the value signal from the base class because
	// signals don't emit when the value is set to null
	override writeValue(value: T | string | null): void {
		console.log('writing value', value);
		if (!value) {
			this.searchInputSignal.set('');
		} else if (typeof value === 'string') {
			this.searchInputSignal.set(value);
		} else {
			this.searchInputSignal.set(this.labelFn()(value));
		}
		console.log('writing value end');
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
