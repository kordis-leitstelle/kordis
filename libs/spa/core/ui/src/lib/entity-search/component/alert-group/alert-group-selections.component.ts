import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	effect,
	inject,
	input,
	viewChildren,
} from '@angular/core';
import {
	FormArray,
	FormControl,
	NonNullableFormBuilder,
	ReactiveFormsModule,
} from '@angular/forms';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';

import { AlertGroup } from '@kordis/shared/model';
import { AlertGroupAssignmentFormGroup } from '@kordis/spa/core/misc';

import { PossibleAlertGroupSelectionsService } from '../../service/alert-group-selection.service';
import { PossibleUnitSelectionsService } from '../../service/unit-selection.service';
import {
	AutocompleteComponent,
	AutocompleteOptionTemplateDirective,
} from '../autocomplete.component';
import { AlertGroupSelectionComponent } from './alert-group-selection.component';

@Component({
	selector: 'krd-alert-group-selections',
	imports: [
		AlertGroupSelectionComponent,
		AsyncPipe,
		AutocompleteComponent,
		AutocompleteOptionTemplateDirective,
		NzCardComponent,
		NzFormModule,
		ReactiveFormsModule,
	],
	template: `
		@let possibleEntitiesToSelect =
			(possibleAlertGroupSelectionsService.allPossibleEntitiesToSelect$
				| async) ?? [];

		<krd-autocomplete
			[formControl]="alertGroupControl"
			[searchFields]="['name']"
			[options]="possibleEntitiesToSelect"
			[labelFn]="alertGroupLabelFn"
		>
			<ng-template
				krdAutocompleteOptionTmpl
				let-alertGroup
				[list]="possibleEntitiesToSelect"
			>
				<span class="name">{{ alertGroup.name }}</span>
				@if (
					alertGroup.assignment?.__typename === 'EntityRescueStationAssignment'
				) {
					<small>Zuordnung: {{ $any(alertGroup.assignment).name }}</small>
				} @else if (
					alertGroup.assignment?.__typename === 'EntityOperationAssignment'
				) {
					<small
						>Zuordnung:
						{{ $any(alertGroup.assignment).operation.alarmKeyword }}
						{{ $any(alertGroup.assignment).operation.sign }}</small
					>
				}
			</ng-template>
		</krd-autocomplete>

		@if (formArray().length) {
			<nz-card [nzBodyStyle]="{ padding: 'calc(var(--base-spacing) / 2)' }">
				<div class="selections">
					@for (
						alertGroupAssignment of formArray().controls;
						track alertGroupAssignment.value.alertGroup!.id
					) {
						<krd-alert-group-selection
							[formGroup]="alertGroupAssignment"
							(removed)="removeAlertGroup($index)"
						/>
					}
				</div>
			</nz-card>
		}
	`,
	styles: `
		.selections:empty {
			margin-top: 0;
		}

		.name {
			margin-right: calc(var(--base-spacing) / 2);
		}

		.selections {
			max-height: 115px;
			overflow: auto;
			display: flex;
			flex-direction: column;
			gap: calc(var(--base-spacing) / 2);
		}

		nz-card {
			margin-top: calc(var(--base-spacing) / 2);
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertGroupSelectionsComponent {
	readonly formArray =
		input.required<FormArray<AlertGroupAssignmentFormGroup>>();
	readonly alertGroupSelectionElements = viewChildren(
		AlertGroupSelectionComponent,
	);
	readonly possibleAlertGroupSelectionsService = inject(
		PossibleAlertGroupSelectionsService,
	);
	readonly alertGroupLabelFn = (alertGroup: AlertGroup): string =>
		alertGroup.name;

	private readonly possibleUnitSelectionsService = inject(
		PossibleUnitSelectionsService,
		{
			optional: true,
		},
	);
	private readonly fb = inject(NonNullableFormBuilder);
	private readonly cd = inject(ChangeDetectorRef);

	readonly alertGroupControl = new FormControl<AlertGroup | null>(null);

	constructor() {
		effect(() => {
			// initially mark alert groups as selected
			this.formArray()
				.getRawValue()
				.forEach((value) =>
					this.possibleAlertGroupSelectionsService.markAsSelected(
						value.alertGroup,
					),
				);
		});

		this.alertGroupControl.valueChanges.subscribe((alertGroup) => {
			if (alertGroup) {
				this.addAlertGroup(alertGroup);
				this.alertGroupControl.setValue(null, { emitEvent: false });
			}
		});
	}

	removeAlertGroup(index: number): void {
		const formValue = this.formArray().at(index).getRawValue();

		// unmark assigned units of the alert group and the alert group itself
		for (const unit of formValue.assignedUnits) {
			this.possibleUnitSelectionsService?.unmarkAsSelected(unit);
		}
		this.possibleAlertGroupSelectionsService.unmarkAsSelected(
			formValue.alertGroup,
		);

		this.formArray().removeAt(index);
	}

	addAlertGroup(alertGroup: AlertGroup): void {
		this.possibleAlertGroupSelectionsService.markAsSelected(alertGroup);
		// newly assigned alert groups should have current units initially
		const alertGroupAssignment = this.fb.group({
			alertGroup: this.fb.control(alertGroup),
			assignedUnits: this.fb.control(
				alertGroup.currentUnits.filter(
					(unit) =>
						!(this.possibleUnitSelectionsService?.isSelected(unit) ?? false),
				),
			),
		});

		this.formArray().push(alertGroupAssignment);

		this.cd.detectChanges(); // detect changes, so alertGroupSelectionElements() will be updated

		this.alertGroupSelectionElements()[
			this.alertGroupSelectionElements().length - 1
		].focusUnitSelection();
	}
}
