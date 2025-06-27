import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	forwardRef,
	inject,
	input,
	output,
	viewChild,
} from '@angular/core';
import {
	FormsModule,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule,
} from '@angular/forms';
import {
	NzAutocompleteComponent,
	NzAutocompleteOptionComponent,
	NzAutocompleteTriggerDirective,
} from 'ng-zorro-antd/auto-complete';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzInputDirective } from 'ng-zorro-antd/input';
import {
	Subject,
	debounceTime,
	filter,
	map,
	merge,
	share,
	switchMap,
} from 'rxjs';

import { ControlValueAccessorBase } from '@kordis/spa/core/misc';

import {
	GeoAddress,
	GeoSearchResult,
} from '../model/geo-search-result.interface';
import { GeoSearchService } from '../service/geo-search.service';

@Component({
	selector: 'krd-geo-search',
	imports: [
		FormsModule,
		NzAutocompleteComponent,
		NzAutocompleteOptionComponent,
		NzAutocompleteTriggerDirective,
		NzInputDirective,
		NzNoAnimationDirective,
		ReactiveFormsModule,
		AsyncPipe,
	],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => GeoSearchComponent),
			multi: true,
		},
	],
	template: `<input
			nz-input
			#input
			(input)="search(input.value)"
			[placeholder]="placeholder()"
			[nzAutocomplete]="geoAutocomplete"
			[nzSize]="size()"
			[disabled]="isDisabled()"
			[(ngModel)]="value"
			(blur)="onTouch()"
			(ngModelChange)="onModelChange($event)"
		/>

		<nz-autocomplete nzNoAnimation #geoAutocomplete nzWidth="400">
			@for (result of searchResults$ | async; track $index) {
				<nz-auto-option
					[nzLabel]="field() ? result.address[field()!] : undefined"
					[nzValue]="result"
					>{{ result.displayValue }}
				</nz-auto-option>
			}
		</nz-autocomplete>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoSearchComponent extends ControlValueAccessorBase {
	/*
	 * The field to display in the autocomplete and set as the value if selected, if not set, the value will be reset after selection
	 */
	readonly field = input<keyof GeoAddress | null>(null);
	readonly placeholder = input<string>('');
	readonly size = input<'small' | 'large' | 'default'>('default');
	/*
	 * The types of search to perform, possible options are:
	 * 1. `address` - shows a match with all address properties
	 */
	readonly searchTypes = input<'address'[] | undefined>(undefined);
	readonly resultSelected = output<GeoSearchResult>();

	private readonly geoSearchSubject$ = new Subject<string>();
	private readonly searchValueChanged$ = this.geoSearchSubject$.pipe(share());
	private readonly geocodeService = inject(GeoSearchService);
	readonly searchResults$ = merge(
		this.searchValueChanged$.pipe(
			filter((query) => query.length > 4),
			debounceTime(300),
			switchMap((query) =>
				this.geocodeService.search(query, this.searchTypes()),
			),
		),
		this.searchValueChanged$.pipe(
			filter((query) => query.length <= 4),
			map(() => [] as GeoSearchResult[]),
		),
	);

	private readonly inputEle = viewChild<ElementRef>('input');

	search(query: string): void {
		this.geoSearchSubject$.next(query);
	}

	onModelChange(value: string | GeoSearchResult): void {
		if (typeof value === 'string') {
			this.onChange(value);
		} else {
			const fieldValue = this.field() ? value.address[this.field()!] || '' : '';
			this.writeValue(fieldValue || ''); // if we have a field, we want to set the value after selection
			this.resultSelected.emit(value);
			this.geoSearchSubject$.next(''); // reset search results after selection
		}
	}

	focus(): void {
		this.inputEle()?.nativeElement.focus();
	}
}
