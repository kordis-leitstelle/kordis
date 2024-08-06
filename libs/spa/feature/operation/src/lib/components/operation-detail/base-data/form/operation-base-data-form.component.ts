import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
	FormArray,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
} from '@angular/forms';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { OperationLocationForm } from '../../../../helper/operation-address-form.factory';
import { OperationAlarmKeywordSelectComponent } from './operation-alarm-keyword-select.component';
import { OperationCategoryTableComponent } from './operation-category-table.component';
import { OperationLocationFormComponent } from './operation-location-form.component';
import { OperationReporterSelectComponent } from './operation-reporter-select.component';

export type OperationBaseDataForm = {
	start: FormControl<Date>;
	end: FormControl<Date | null>;
	alarmKeyword: FormControl<string>;
	reporter: FormControl<string>;
	commander: FormControl<string>;
	externalReference: FormControl<string>;
	location: OperationLocationForm;
	categories: FormArray<
		FormGroup<{
			name: FormControl<string>;
			count: FormControl<number>;
			patientCount: FormControl<number>;
			dangerousSituationCount: FormControl<number>;
			wasDangerous: FormControl<boolean>;
		}>
	>;
};
export type OperationBaseDataFormGroup = FormGroup<OperationBaseDataForm>;

@Component({
	selector: 'krd-operation-base-data-form',
	standalone: true,
	imports: [
		CommonModule,
		NzCardComponent,
		NzColDirective,
		NzDatePickerComponent,
		NzInputDirective,
		NzNoAnimationDirective,
		NzRowDirective,
		OperationAlarmKeywordSelectComponent,
		OperationCategoryTableComponent,
		OperationLocationFormComponent,
		OperationReporterSelectComponent,
		ReactiveFormsModule,
		NzFormModule,
		NzTooltipDirective,
	],
	template: `
		<form nz-form [formGroup]="formGroup()" nzLayout="vertical">
			<div nz-row nzGutter="15">
				<div nz-col nzSpan="12">
					<nz-form-item>
						<nz-form-label>Beginn</nz-form-label>
						<nz-form-control>
							<nz-date-picker
								formControlName="start"
								nzNoAnimation
								nzShowTime
								nzFormat="dd.MM.yyyy HH:mm:ss"
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
								nzFormat="dd.MM.yyyy HH:mm:ss"
								[nzPlaceHolder]="
									formGroup().controls.end.disabled ? 'Laufend...' : ''
								"
								[nz-tooltip]="
									formGroup().controls.end.disabled
										? 'Der Einsatz muss zunächst beendet werden, um das Feld zu bearbeiten!'
										: ''
								"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>

			<krd-operation-location-form
				[formGroup]="formGroup().controls.location"
			/>

			<div nz-row nzGutter="15">
				<div nz-col nzSpan="12">
					<nz-form-item>
						<nz-form-label>Alarmstichwort</nz-form-label>
						<nz-form-control>
							<krd-alarm-keyword-select formControlName="alarmKeyword" />
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="12">
					<nz-form-item>
						<nz-form-label>Alarmierung</nz-form-label>
						<nz-form-control>
							<krd-reporter-select formControlName="reporter" />
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>
			<div nz-row nzGutter="15">
				<div nz-col nzSpan="12">
					<nz-form-item>
						<nz-form-label>Leiter</nz-form-label>
						<nz-form-control>
							<input nz-input formControlName="commander" />
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="12">
					<nz-form-item>
						<nz-form-label>Externe Nummer</nz-form-label>
						<nz-form-control>
							<input nz-input formControlName="externalReference" />
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>
		</form>
		<div class="category-container">
			<krd-operation-category-table
				[formArray]="formGroup().controls.categories"
			/>
		</div>
	`,
	styles: `
		.category-container {
			padding-top: 5px;
			overflow: auto;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationBaseDataFormComponent {
	readonly formGroup = input.required<OperationBaseDataFormGroup>();
}
