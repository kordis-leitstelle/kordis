import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import {
	FormArray,
	FormControl,
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
	NzFormControlComponent,
	NzFormDirective,
	NzFormItemComponent,
} from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { CreateOperationInput, Mutation, Unit } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import {
	AlertGroupAssignmentFormGroup,
	DateMaskInputComponent,
	alertGroupMinUnitsValidator,
	markInvalidFormControlsAsDirty,
} from '@kordis/spa/core/misc';
import {
	AlertGroupSelectionsComponent,
	PossibleAlertGroupSelectionsService,
	PossibleUnitSelectionsService,
	UnitSelectionOptionComponent,
	UnitsSelectionComponent,
} from '@kordis/spa/core/ui';

import { makeOperationLocationForm } from '../../helper/operation-address-form.factory';
import { dateNotInPastValidator } from '../../validator/date-not-in-past.validator';
import { nameOrStreetRequiredValidator } from '../../validator/name-or-street-required.validator';
import { startBeforeEndValidator } from '../../validator/start-before-end.validator';
import { OperationAlarmKeywordSelectComponent } from '../operation-detail/base-data/form/operation-alarm-keyword-select.component';
import { OperationLocationFormComponent } from '../operation-detail/base-data/form/operation-location-form.component';
import { OperationDescriptionTextareaComponent } from '../operation-detail/description/operation-description-textarea.component';

@Component({
	selector: 'krd-create-operation-modal',
	imports: [
		AlertGroupSelectionsComponent,
		NzButtonComponent,
		NzColDirective,
		NzFormControlComponent,
		NzFormDirective,
		NzFormItemComponent,
		NzRowDirective,
		OperationAlarmKeywordSelectComponent,
		OperationDescriptionTextareaComponent,
		OperationLocationFormComponent,
		ReactiveFormsModule,
		UnitsSelectionComponent,
		DateMaskInputComponent,
		NzAlertComponent,
		UnitSelectionOptionComponent,
	],
	providers: [
		PossibleUnitSelectionsService,
		PossibleAlertGroupSelectionsService,
	],
	templateUrl: `./create-operation-modal.component.html`,
	styles: `
		.action-btns {
			display: flex;
			justify-content: flex-end;
		}

		.alert-container {
			margin: calc(var(--base-spacing) / 2) 0;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateOperationModalComponent {
	readonly isLoading = signal(false);
	readonly #modal = inject(NzModalRef);
	private readonly fb = inject(NonNullableFormBuilder);
	readonly formGroup = this.fb.group(
		{
			start: this.fb.control(new Date(), [
				Validators.required,
				dateNotInPastValidator,
			]),
			end: this.fb.control<Date>(new Date(), [
				Validators.required,
				dateNotInPastValidator,
			]),
			location: makeOperationLocationForm(this.fb, {
				address: [nameOrStreetRequiredValidator],
			}),
			alarmKeyword: this.fb.control('', Validators.required),
			description: this.fb.control(''),
			units: this.fb.control<Unit[]>([]),
			alertGroups: this.fb.array<AlertGroupAssignmentFormGroup>(
				[],
				alertGroupMinUnitsValidator,
			),
		},
		{
			validators: [
				startBeforeEndValidator,
				(formGroup) => {
					const units = formGroup.get('units') as FormControl<Unit[]>;
					const alertGroups = formGroup.get(
						'alertGroups',
					) as FormArray<AlertGroupAssignmentFormGroup>;
					if (units.value.length === 0 && alertGroups.length === 0) {
						units.setErrors({ noUnitsOrAlertGroups: true });
						alertGroups.setErrors({ noUnitsOrAlertGroups: true });
						return { noUnitsOrAlertGroups: true };
					}
					units.setErrors(null);
					alertGroups.setErrors(null);

					return null;
				},
			],
		},
	);

	private readonly gqlService = inject(GraphqlService);
	private readonly notificationService = inject(NzNotificationService);

	createOperation(): void {
		markInvalidFormControlsAsDirty(this.formGroup);
		if (this.formGroup.invalid) {
			return;
		}

		this.isLoading.set(true);
		this.gqlService
			.mutate$<{
				createOperation: Mutation['createOperation'];
			}>(
				gql`
					mutation CreateOperation($input: CreateOperationInput!) {
						createOperation(operation: $input) {
							id
							sign
						}
					}
				`,
				{
					input: this.getPayloadFromForm(),
				},
			)
			.subscribe({
				next: ({ createOperation }) => {
					this.notificationService.success(
						'Einsatz erstellt',
						`Der Einsatz wurde mit der Einsatznummer ${createOperation.sign} erstellt.`,
						{ nzPlacement: 'topRight' },
					);
					this.#modal.destroy({
						operationId: createOperation.id,
					});
				},
				error: () =>
					this.notificationService.error(
						'Fehler',
						'Einsatz konnte nicht erstellt werden.',
					),
			})
			.add(() => this.isLoading.set(false));
	}

	private getPayloadFromForm(): CreateOperationInput {
		const formData = this.formGroup.getRawValue();

		return {
			start: formData.start.toISOString(),
			end: formData.end.toISOString(),
			alarmKeyword: formData.alarmKeyword,
			location: {
				...formData.location,
				coordinate:
					formData.location?.coordinate?.lat &&
					formData.location?.coordinate?.lon
						? {
								lat: formData.location.coordinate.lat,
								lon: formData.location.coordinate.lon,
							}
						: null,
			},
			assignedUnitIds: formData.units.map((unit) => unit.id),
			assignedAlertGroups: formData.alertGroups.map((assignment) => ({
				alertGroupId: assignment.alertGroup.id,
				assignedUnitIds: assignment.assignedUnits.map((unit) => unit.id),
			})),
		};
	}
}
