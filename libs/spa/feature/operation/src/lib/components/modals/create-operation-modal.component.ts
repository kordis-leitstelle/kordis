import { NgStyle } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	signal,
} from '@angular/core';
import {
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import {
	NzFormControlComponent,
	NzFormDirective,
	NzFormItemComponent,
} from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { markInvalidFormControlsAsDirty } from 'spa/core/misc';

import { Mutation } from '@kordis/shared/model';
import { GeoSearchComponent } from '@kordis/spa/core/geocoding';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { makeOperationLocationForm } from '../../helper/operation-address-form.factory';
import { dateInPastValidator } from '../../validator/date-in-past.validator';
import { nameOrStreetRequiredValidator } from '../../validator/name-or-street-required.validator';
import { startBeforeEndValidator } from '../../validator/start-before-end.validator';
import { OperationAlarmKeywordSelectComponent } from '../operation-detail/base-data/form/operation-alarm-keyword-select.component';
import { OperationLocationFormComponent } from '../operation-detail/base-data/form/operation-location-form.component';
import { OperationDescriptionTextareaComponent } from '../operation-detail/description/operation-description-textarea.component';


@Component({
	selector: 'krd-create-operation-modal',
	standalone: true,
	imports: [
		NzColDirective,
		NzDatePickerComponent,
		NzNoAnimationDirective,
		NzRowDirective,
		OperationLocationFormComponent,
		OperationAlarmKeywordSelectComponent,
		ReactiveFormsModule,
		NzButtonComponent,
		OperationDescriptionTextareaComponent,
		NzAlertComponent,
		NzFormControlComponent,
		NzFormItemComponent,
		NzFormDirective,
		GeoSearchComponent,
		NzInputDirective,
		NzInputNumberComponent,
		NgStyle,
	],
	template: `
		<form
			nz-form
			[formGroup]="formGroup"
			nzLayout="vertical"
			(ngSubmit)="createOperation()"
		>
			<div nz-row nzGutter="15">
				<div nz-col nzSpan="12">
					<nz-form-item>
						<nz-form-label>Start</nz-form-label>
						<nz-form-control>
							<nz-date-picker
								formControlName="start"
								nzNoAnimation
								nzShowTime
								nzAllowClear="false"
								nzFormat="dd.MM.yyy HH:mm:ss"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="12">
					<nz-form-item>
						<nz-form-label>Ende</nz-form-label>
						<nz-form-control>
							<nz-date-picker
								formControlName="end"
								nzNoAnimation
								nzShowTime
								nzFormat="dd.MM.yyy HH:mm:ss"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>

			<krd-operation-location-form
				[formGroup]="formGroup.controls.location"
				(formCompleted)="alarmKeywordEle.focus()"
			/>

			<div nz-row nzGutter="15">
				<div nz-col nzSpan="8">
					<nz-form-item>
						<nz-form-label>Alarmstichwort</nz-form-label>
						<nz-form-control nzErrorTip="Das Alarmstichtwort fehlt!">
							<krd-alarm-keyword-select
								#alarmKeywordEle
								formControlName="alarmKeyword"
								(keywordSelected)="descriptionEle.focus()"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>

				<div nz-col nzSpan="16">
					<nz-form-item>
						<nz-form-label>Einsatzmeldung</nz-form-label>
						<nz-form-control>
							<krd-operation-description-textarea
								#descriptionEle
								formControlName="description"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>

			<div nz-row>
				<div nz-col nzSpan="24" class="action-btns">
					<button
						type="submit"
						nz-button
						nzSize="large"
						nzDanger
						[disabled]="isLoading()"
						[nzLoading]="isLoading()"
					>
						Einsatz erstellen
					</button>
				</div>
			</div>
			<div nz-row style="margin-top: 5px">
				<div nz-col nzSpan="24">
					<nz-alert
						nzType="info"
						nzDescription="Es wird ein laufender Einsatz angelegt. Zugeordnete Einheiten werden potentiell aus anderen Zuordnungen rausgelöst!"
					/>
				</div>
			</div>
		</form>
	`,
	styles: `
		.action-btns {
			display: flex;
			justify-content: flex-end;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateOperationModalComponent {
	readonly #modal = inject(NzModalRef);
	readonly isLoading = signal(false);

	private readonly fb = inject(NonNullableFormBuilder);
	readonly formGroup = this.fb.group(
		{
			start: this.fb.control(new Date(), [
				Validators.required,
				dateInPastValidator,
			]),
			end: this.fb.control<Date | null>(null),
			location: makeOperationLocationForm(this.fb, {
				address: [nameOrStreetRequiredValidator],
			}),
			alarmKeyword: this.fb.control('', Validators.required),
			description: this.fb.control(''),
		},
		{
			validators: [startBeforeEndValidator],
		},
	);

	private readonly gqlService = inject(GraphqlService);
	private readonly notificationService = inject(NzNotificationService);
	private readonly cd = inject(ChangeDetectorRef);

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
					input: {
						start: this.formGroup.value.start,
						end: this.formGroup.value.end,
						alarmKeyword: this.formGroup.value.alarmKeyword,
						location: {
							...this.formGroup.value.location,
							coordinate:
								this.formGroup.value.location?.coordinate?.lat &&
								this.formGroup.value.location?.coordinate?.lon
									? this.formGroup.value.location?.coordinate
									: null,
						},
						description: this.formGroup.value.description,
						assignedUnitIds: ['65d7d90709cdb6f3b2082ab3'],
						assignedAlertGroups: [],
					},
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
				error: (e) => {
					console.log(JSON.stringify(e));
					this.notificationService.error(
						'Fehler',
						'Einsatz konnte nicht erstellt werden.',
					);
				},
			})
			.add(() => this.isLoading.set(false));
	}
}
