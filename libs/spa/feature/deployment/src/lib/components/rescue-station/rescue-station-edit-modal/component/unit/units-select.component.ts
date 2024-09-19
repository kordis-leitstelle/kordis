import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	TemplateRef,
	contentChild,
	effect,
	inject,
	input,
	viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
	NzFormControlComponent,
	NzFormItemComponent,
} from 'ng-zorro-antd/form';
import { NzSelectComponent, NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import {
	Observable,
	Subject,
	filter,
	merge,
	scan,
	share,
	startWith,
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
		NgTemplateOutlet,
		NzSpinComponent,
		NzFormControlComponent,
		NzFormItemComponent,
	],
	template: `
		<nz-form-item>
			<nz-form-control>
				<nz-select
					nzServerSearch
					nzShowSearch
					nzMode="multiple"
					nzNotFoundContent="Keine weiteren Einheiten gefunden."
					[formControl]="control()"
					(nzOnSearch)="onSearch($event)"
					(nzFocus)="onFocus()"
					[nzOptionHeightPx]="45"
				>
					@for (unit of unitResults$ | async; track unit.id) {
						<nz-option
							nzCustomContent
							[nzValue]="unit"
							[nzKey]="unit.id"
							[nzLabel]="unit.callSign"
						>
							@if (templateRef()) {
								<ng-container
									*ngTemplateOutlet="
										templateRef()!;
										context: { $implicit: unit }
									"
								></ng-container>
							} @else {
								{{ unit.callSign }}
								<span class="unit-name">{{ unit.name }}</span>
							}
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
			</nz-form-control>
		</nz-form-item>
	`,
	styles: `
		nz-select {
			width: 100%;
			height: 100%;
		}

		.unit-name {
			color: grey;
			font-size: 0.9em;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsSelectComponent implements OnDestroy {
	readonly templateRef = contentChild(TemplateRef);

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
		// on search
		this.searchValueChanged$.pipe(
			filter((value) => value !== ''),
			switchMap((value) =>
				this.possibleUnitSelectionsService.searchAllPossibilities(value),
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
					startWith(this.control().value),
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
