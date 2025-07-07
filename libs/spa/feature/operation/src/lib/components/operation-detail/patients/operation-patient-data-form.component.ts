import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzInputDirective } from 'ng-zorro-antd/input';

import {
	GeoSearchComponent,
	GeoSearchResult,
} from '@kordis/spa/core/geocoding';
import { DateMaskInputComponent } from '@kordis/spa/core/misc';

import { PatientFormGroup } from './operation-patients.component';

@Component({
	selector: 'krd-operation-patient-data-form',
	imports: [
		GeoSearchComponent,
		NzColDirective,
		NzFormModule,
		NzInputDirective,
		NzRowDirective,
		ReactiveFormsModule,
		DateMaskInputComponent,
	],
	template: `
		<form nz-form [formGroup]="formGroup()" nzLayout="vertical">
			<div nz-row nzGutter="15">
				<div nz-col nzSpan="8">
					<nz-form-item>
						<nz-form-label>Vorname</nz-form-label>
						<nz-form-control>
							<input nzSize="small" nz-input formControlName="firstName" />
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="8">
					<nz-form-item>
						<nz-form-label>Nachname</nz-form-label>
						<nz-form-control>
							<input nzSize="small" nz-input formControlName="lastName" />
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="8">
					<nz-form-item>
						<nz-form-label>Geburtstag</nz-form-label>
						<nz-form-control>
							<krd-date-mask-input
								maskType="date"
								size="small"
								formControlName="birthDate"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>
			<div nz-row nzGutter="15" formGroupName="address">
				<div nz-col nzSpan="12">
					<nz-form-item>
						<nz-form-label>Straße</nz-form-label>
						<nz-form-control>
							<krd-geo-search
								size="small"
								formControlName="street"
								field="street"
								placeholder="Adress-Suche"
								[searchTypes]="['address']"
								(resultSelected)="onAddressSelected($event)"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="4">
					<nz-form-item>
						<nz-form-label>PLZ</nz-form-label>
						<nz-form-control>
							<input nzSize="small" nz-input formControlName="postalCode" />
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="8">
					<nz-form-item>
						<nz-form-label>Stadt</nz-form-label>
						<nz-form-control>
							<input nzSize="small" nz-input formControlName="city" />
						</nz-form-control>
					</nz-form-item>
				</div>
			</div>
			<div nz-row nzGutter="15">
				<div nz-col nzSpan="10">
					<nz-form-item>
						<nz-form-label>Telefonnummer</nz-form-label>
						<nz-form-control>
							<input nzSize="small" nz-input formControlName="phoneNumber" />
						</nz-form-control>
					</nz-form-item>
				</div>
				<div nz-col nzSpan="14">
					<nz-form-item>
						<nz-form-label>Verbleib</nz-form-label>
						<nz-form-control>
							<input nzSize="small" nz-input formControlName="whereabouts" />
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

	onAddressSelected(res: GeoSearchResult): void {
		this.formGroup().controls.address.patchValue({
			street: res.address.street,
			postalCode: res.address.postalCode,
			city: res.address.city,
		});
	}
}
