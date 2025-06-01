import {
	ChangeDetectionStrategy,
	Component,
	input,
	viewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';

import { DateMaskInputComponent } from '@kordis/spa/core/misc';
import {
	AlertGroupSelectionsComponent,
	UnitSelectionOptionComponent,
	UnitsSelectionComponent,
} from '@kordis/spa/core/ui';

import { CreateOperationFormGroup } from '../../helper/create-operation-form.helper';
import { OperationAlarmKeywordSelectComponent } from '../operation-detail/base-data/form/operation-alarm-keyword-select.component';
import { OperationLocationFormComponent } from '../operation-detail/base-data/form/operation-location-form.component';
import { OperationDescriptionTextareaComponent } from '../operation-detail/description/operation-description-textarea.component';

@Component({
	selector: 'krd-create-operation-form',
	imports: [
		AlertGroupSelectionsComponent,
		DateMaskInputComponent,
		FormsModule,
		NzAlertComponent,
		NzColDirective,
		NzRowDirective,
		OperationLocationFormComponent,
		OperationAlarmKeywordSelectComponent,
		OperationDescriptionTextareaComponent,
		UnitSelectionOptionComponent,
		UnitsSelectionComponent,
		ReactiveFormsModule,
		NzFormModule,
	],
	template: `
		<ng-container [formGroup]="formGroup()">
			<div nz-row nzGutter="12">
				<div nz-col nzSpan="12">
					<nz-form-item>
						<nz-form-label>Start</nz-form-label>
						<nz-form-control nzErrorTip="Muss in der Vergangenheit liegen!">
							<krd-date-mask-input formControlName="start" />
						</nz-form-control>
					</nz-form-item>
				</div>
				@if (formGroup().controls.end.enabled) {
					<div nz-col nzSpan="12">
						<nz-form-item>
							<nz-form-label>Ende</nz-form-label>
							<nz-form-control
								nzErrorTip="Muss nach dem Start und in der Vergangenheit liegen!"
							>
								<krd-date-mask-input formControlName="end" />
							</nz-form-control>
						</nz-form-item>
					</div>
				}
			</div>

			<krd-operation-location-form
				(formCompleted)="alarmKeywordEle.focus()"
				[formGroup]="formGroup().controls.location"
			/>

			<div nz-row nzGutter="12">
				<div nz-col nzSpan="8">
					<nz-form-item>
						<nz-form-label>Alarmstichwort</nz-form-label>
						<nz-form-control nzErrorTip="Das Alarmstichtwort fehlt!">
							<krd-alarm-keyword-select
								#alarmKeywordEle
								(keywordSelected)="descriptionEle.focus()"
								formControlName="alarmKeyword"
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
				<div nz-col nzSpan="24">
					<nz-form-item>
						<nz-form-label>Einheiten</nz-form-label>
						<nz-form-control
							nzErrorTip="Mindestens eine Alarmgruppe oder Einheit muss hinzugefügt werden!"
						>
							<krd-units-select [control]="formGroup().controls.units">
								<ng-template let-unit>
									<krd-unit-selection-option [unit]="unit" />
								</ng-template>
							</krd-units-select>
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>

			<div nz-row>
				<div nz-col nzSpan="24">
					<krd-alert-group-selections
						[formArray]="formGroup().controls.alertGroups"
					/>
				</div>
			</div>
		</ng-container>
		<div nz-row>
			<div nz-col nzSpan="24">
				@if (
					formGroup().controls.units.dirty &&
					formGroup().controls.units.errors?.noUnitsOrAlertGroups
				) {
					<nz-alert
						nzType="error"
						nzMessage="Mindestens eine Einheit oder eine Alarmgruppe mit einer Einheit muss hinzugefügt werden!"
					/>
				}
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateOperationFormComponent {
	formGroup = input.required<CreateOperationFormGroup>();
	private readonly geoLocationComponent = viewChild(
		OperationLocationFormComponent,
	);

	focusLocation(): void {
		this.geoLocationComponent()?.focusGeoSearch();
	}
}
