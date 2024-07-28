import { AsyncPipe } from '@angular/common';
import { Component, Output, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
	NzAutocompleteModule,
	NzAutocompleteOptionComponent,
} from 'ng-zorro-antd/auto-complete';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Subject, debounceTime, filter, merge, share, switchMap } from 'rxjs';

import { AlertGroup } from '@kordis/shared/model';

import { PossibleAlertGroupSelectionsService } from '../../service/alert-group-selection.service';

@Component({
	selector: 'krd-alert-group-autocomplete',
	standalone: true,
	imports: [
		AsyncPipe,
		NzAutocompleteModule,
		NzInputDirective,
		NzNoAnimationDirective,
		NzSelectModule,
		ReactiveFormsModule,
	],
	template: `
		<input
			[formControl]="searchInput"
			nz-input
			(focus)="onSearchInputFocus()"
			[nzAutocomplete]="auto"
			[nzStatus]="showErrorState() ? 'error' : ''"
		/>
		<nz-autocomplete
			(selectionChange)="onUnitSelected($event)"
			[nzBackfill]="false"
			[nzNoAnimation]="true"
			#auto
		>
			@for (alertGroup of alertGroupResults$ | async; track alertGroup.id) {
				<nz-auto-option [nzValue]="alertGroup">
					<div class="result-item">
						<span class="name">{{ alertGroup.name }}</span>
						@if (
							alertGroup.assignment?.__typename ===
							'EntityRescueStationAssignment'
						) {
							<small>Zuordnung: {{ alertGroup.assignment!.name }}</small>
						}
					</div>
				</nz-auto-option>
			}
		</nz-autocomplete>
	`,
	styles: `
		.result-item {
			display: flex;
			flex-direction: column;

			.name {
				font-weight: 500;
			}
		}
	`,
})
export class AlertGroupAutocompleteComponent {
	readonly showErrorState = input<boolean>(false);

	readonly searchInput = new FormControl<string | AlertGroup>('');
	readonly possibleAlertGroupSelectionService = inject(
		PossibleAlertGroupSelectionsService,
	);
	private readonly alertGroupSelectedSubject$ = new Subject<AlertGroup>();
	// eslint-disable-next-line rxjs/finnish
	@Output() readonly alertGroupSelected = this.alertGroupSelectedSubject$
		.asObservable()
		.pipe(share());

	private readonly searchInputFocusedSubject$ = new Subject<void>();
	readonly alertGroupResults$ = merge(
		merge(
			this.searchInputFocusedSubject$,
			this.searchInput.valueChanges.pipe(filter((value) => value === '')),
		).pipe(
			switchMap(
				() =>
					this.possibleAlertGroupSelectionService.allPossibleEntitiesToSelect$,
			),
		),
		this.searchInput.valueChanges.pipe(
			filter((value): value is string => typeof value === 'string'),
			debounceTime(300),
			switchMap((value) =>
				value
					? this.possibleAlertGroupSelectionService.searchAllPossibilities(
							value,
						)
					: [],
			),
		),
	);

	onUnitSelected({ nzValue: unit }: NzAutocompleteOptionComponent): void {
		this.alertGroupSelectedSubject$.next(unit);
		this.searchInput.reset();
	}

	onSearchInputFocus(): void {
		this.searchInputFocusedSubject$.next();
	}
}
