import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';

import {
	GeoSearchComponent,
	GeoSearchResult,
} from '@kordis/spa/core/geocoding';

import { OperationLocationFormComponent } from '../base-data/form/operation-location-form.component';
import { PatientFormGroup } from './operation-patients.component';


@Component({
	selector: 'krd-operation-patient-data-form',
	standalone: true,
	imports: [
		CommonModule,
		OperationLocationFormComponent,
		NzColDirective,
		NzDatePickerComponent,
		NzInputDirective,
		NzOptionComponent,
		NzRowDirective,
		NzSelectComponent,
		ReactiveFormsModule,
		NzButtonComponent,
		GeoSearchComponent,
		NzFormModule,
	],
	template: `
		<form nz-form [formGroup]="formGroup()" nzLayout="vertical">
			<div nz-row nzGutter="15">
				<div nz-col nzSpan="8" class="col">
					<nz-form-item>
						<nz-form-label>Vorname</nz-form-label>
						<nz-form-control>
							<input [nzSize]="size()" nz-input formControlName="firstName" />
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="8" class="col">
					<nz-form-item>
						<nz-form-label>Nachname</nz-form-label>
						<nz-form-control>
							<input [nzSize]="size()" nz-input formControlName="lastName" />
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="8" class="col">
					<nz-form-item>
						<nz-form-label>Geburtstag</nz-form-label>
						<nz-form-control>
							<nz-date-picker
								nzFormat="dd.MM.yyyy"
								formControlName="birthDate"
								[nzSize]="size()"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>
			<div nz-row nzGutter="15" formGroupName="address">
				<div nz-col nzSpan="12" class="col">
					<nz-form-item>
						<nz-form-label>Straße</nz-form-label>
						<nz-form-control>
							<krd-geo-search
								formControlName="street"
								field="street"
								placeholder="Adress-Suche"
								[searchTypes]="['address']"
								[size]="size()"
								(resultSelected)="onAddressSelected($event)"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="4" class="col">
					<nz-form-item>
						<nz-form-label>PLZ</nz-form-label>
						<nz-form-control>
							<input [nzSize]="size()" nz-input formControlName="postalCode" />
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="8" class="col">
					<nz-form-item>
						<nz-form-label>Stadt</nz-form-label>
						<nz-form-control>
							<input [nzSize]="size()" nz-input formControlName="city" />
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>
			<div nz-row nzGutter="15">
				<div nz-col nzSpan="10" class="col">
					<nz-form-item>
						<nz-form-label>Telefonnummer</nz-form-label>
						<nz-form-control>
							<input [nzSize]="size()" nz-input formControlName="phoneNumber" />
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="14" class="col">
					<nz-form-item>
						<nz-form-label>Verbleib</nz-form-label>
						<nz-form-control>
							<input [nzSize]="size()" nz-input formControlName="whereabouts" />
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>
		</form>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationPatientDataFormComponent {
	readonly formGroup = input.required<PatientFormGroup>();
	readonly size = input<'small' | 'default'>('default');

	onAddressSelected(res: GeoSearchResult): void {
		this.formGroup().controls.address.patchValue({
			street: res.address.street,
			postalCode: res.address.postalCode,
			city: res.address.city,
		});
	}
}
