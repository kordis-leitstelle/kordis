import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	effect,
	inject,
	input,
	viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzSelectComponent, NzSelectModule } from 'ng-zorro-antd/select';
import {
	Observable,
	Subject,
	debounceTime,
	filter,
	merge,
	scan,
	share,
	switchMap,
	takeUntil,
} from 'rxjs';

import { Unit } from '@kordis/shared/model';

import { PossibleUnitSelectionsService } from '../../service/unit-selection.service';
import { UnitSelectionOptionComponent } from './unit-selection-option.component';

@Component({
	selector: 'krd-units-select',
	standalone: true,
	imports: [
		AsyncPipe,
		NzSelectModule,
		ReactiveFormsModule,
		UnitSelectionOptionComponent,
	],
	template: `
		<nz-select
			nzServerSearch
			nzShowSearch
			nzMode="multiple"
			nzNotFoundContent="Keine weiteren Einheiten gefunden."
			[formControl]="control()"
			(nzOnSearch)="onSearch($event)"
			(nzFocus)="onFocus()"
			[nzOptionHeightPx]="45"
			[nzStatus]="control().invalid && control().touched ? 'error' : ''"
		>
			@for (unit of unitResults$ | async; track unit.id) {
				<nz-option
					nzCustomContent
					[nzValue]="unit"
					[nzKey]="unit.id"
					[nzLabel]="unit.callSign"
				>
					<krd-unit-selection-option [unit]="unit" />
				</nz-option>
			}
			<!-- The values are only shown as selected if they are present as options -->
			@for (unit of control().value; track unit.id) {
				<nz-option
					nzHide
					[nzValue]="unit"
					[nzKey]="unit.id"
					[nzLabel]="unit.callSign"
				/>
			}
		</nz-select>
	`,
	styles: `
		nz-select {
			width: 100%;
			height: 100%;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsSelectComponent implements OnDestroy {
	readonly control = input.required<FormControl<Unit[]>>(); // must be a form control, as nz-select does not support form arrays

	private readonly searchValueChangedSubject$ = new Subject<string>();
	private readonly onSelectionChangedSubject$ = new Subject<void>();
	private readonly onFocusSubject$ = new Subject<void>();
	private readonly searchValueChanged$ =
		this.searchValueChangedSubject$.pipe(share());
	private readonly possibleUnitSelectionsService = inject(
		PossibleUnitSelectionsService,
	);

	protected readonly unitResults$: Observable<Unit[]> = merge(
		// if search cleared, selection changed, or focused, show all possible units
		merge(
			this.searchValueChanged$.pipe(filter((value) => value === '')),
			this.onSelectionChangedSubject$,
			this.onFocusSubject$,
		).pipe(
			switchMap(
				() => this.possibleUnitSelectionsService.allPossibleEntitiesToSelect$,
			),
		),
		// search
		this.searchValueChanged$.pipe(
			filter((value) => value !== ''),
			debounceTime(300),
			switchMap((value) =>
				value
					? this.possibleUnitSelectionsService.searchAllPossibilities(value)
					: [],
			),
		),
	);
	private selectEle = viewChild(NzSelectComponent);
	private readonly destroySubject$ = new Subject<void>();

	constructor() {
		effect(() => {
			this.destroySubject$.next();
			// units selected should not be visible in the search while units that are unselected should become visible again
			this.control()
				.valueChanges.pipe(
					scan((prev, curr) => {
						// naively unmark all previously selected units
						prev.forEach((unit) =>
							this.possibleUnitSelectionsService.unmarkAsSelected(unit),
						);

						// mark all currently selected
						curr.forEach((unit) =>
							this.possibleUnitSelectionsService.markAsSelected(unit),
						);

						return curr;
					}, [] as Unit[]),
					takeUntil(this.destroySubject$),
				)
				.subscribe(() => this.onSelectionChangedSubject$.next());
		});
	}

	ngOnDestroy(): void {
		this.destroySubject$.next();
		this.destroySubject$.complete();
	}

	focus(): void {
		this.selectEle()?.focus();
		this.selectEle()?.setOpenState(true);
	}

	protected onSearch(value: string): void {
		this.searchValueChangedSubject$.next(value);
	}

	protected onFocus(): void {
		this.onFocusSubject$.next();
	}
}
