import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { DateMaskInputComponent } from '@kordis/spa/core/misc';

import { OperationLocationFormGroup } from '../../../../helper/operation-address-form.factory';
import { OperationAlarmKeywordSelectComponent } from './operation-alarm-keyword-select.component';
import { OperationLocationFormComponent } from './operation-location-form.component';
import { OperationReporterSelectComponent } from './operation-reporter-select.component';

export type OperationBaseDataForm = {
	start: FormControl;
	end: FormControl;
	alarmKeyword: FormControl;
	reporter: FormControl;
	commander: FormControl;
	externalReference: FormControl;
	location: OperationLocationFormGroup;
};
export type OperationBaseDataFormGroup = FormGroup<OperationBaseDataForm>;

@Component({
	selector: 'krd-operation-base-data-form',
	imports: [
		CommonModule,
		DateMaskInputComponent,
		NzColDirective,
		NzFormModule,
		NzInputDirective,
		NzRowDirective,
		NzTooltipDirective,
		OperationAlarmKeywordSelectComponent,
		OperationLocationFormComponent,
		OperationReporterSelectComponent,
		ReactiveFormsModule,
	],
	template: `
		<div class="container">
			<form nz-form [formGroup]="formGroup()" nzLayout="vertical">
				<div nz-row nzGutter="15">
					<div nz-col nzSpan="12">
						<nz-form-item>
							<nz-form-label>Beginn</nz-form-label>
							<nz-form-control>
								<krd-date-mask-input formControlName="start" />
							</nz-form-control>
						</nz-form-item>
					</div>
					<div nz-col nzSpan="12">
						<nz-form-item>
							<nz-form-label>Ende</nz-form-label>
							<nz-form-control>
								@if (formGroup().controls.end.disabled) {
									<input
										placeholder="Laufend..."
										nz-input
										disabled
										nz-tooltip="Der Einsatz muss zunächst beendet werden, um das Feld zu bearbeiten!"
									/>
								} @else {
									<krd-date-mask-input formControlName="end" />
								}
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
		</div>
	`,
	styles: `
		.container {
			height: 100%;
			display: flex;
			flex-direction: column;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationBaseDataFormComponent {
	readonly formGroup = input.required<OperationBaseDataFormGroup>();
}
