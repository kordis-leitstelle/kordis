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
			(blur)="onTouch()"
			[value]="searchInput$ | async"
			[disabled]="isDisabled()"
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

	private filterOptions(options: T[], searchInput: string): T[] {
		if (this.searchFields().length === 0) {
			return options
				.filter((option) =>
					this.labelFn()(option)
						.toLocaleLowerCase()
						.includes(searchInput.toLocaleLowerCase()),
				)
				.toSorted((a, b) => this.labelFn()(a).localeCompare(this.labelFn()(b)));
		}

		return options
			.filter((option) =>
				this.searchFields().some((field) => {
					// we know this because we only allow `StringKey<T>`s
					const value = option[field] as string;

					return value
						.toLocaleLowerCase()
						.includes(searchInput.toLocaleLowerCase());
				}),
			)
			.toSorted((a, b) => this.labelFn()(a).localeCompare(this.labelFn()(b)));
	}
}
