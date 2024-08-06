import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	booleanAttribute,
	effect,
	input,
	output,
	viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { Subject, takeUntil } from 'rxjs';

import {
	GeoSearchComponent,
	GeoSearchResult,
} from '@kordis/spa/core/geocoding';

import { OperationLocationForm } from '../../../../helper/operation-address-form.factory';

@Component({
	selector: 'krd-operation-location-form',
	standalone: true,
	imports: [
		NzRowDirective,
		NzColDirective,
		GeoSearchComponent,
		NzInputNumberComponent,
		ReactiveFormsModule,
		NzFormModule,
		NzInputDirective,
	],
	template: `
		<div nz-form nzLayout="vertical" [formGroup]="formGroup()">
			<div nz-row nzGutter="15">
				<div nz-col nzSpan="12" formGroupName="address">
					<nz-form-item>
						<nz-form-label
							nzTooltipTitle="Gebräuchlicher Eigennamen des Objektes (Gewässer, Unternehmen...)."
						>
							Objektname
						</nz-form-label>
						<nz-form-control nzErrorTip="Objektname oder Straße fehlt!">
							<krd-geo-search
								#nameGeoSearch
								field="name"
								formControlName="name"
								(resultSelected)="searchResultSelected($event)"
								placeholder="Geo-Suche"
							/>
						</nz-form-control>
					</nz-form-item>
				</div>
				<ng-container formGroupName="coordinate">
					<div nz-col nzSpan="6">
						<nz-form-item>
							<nz-form-label
								nzTooltipTitle="Zu diesen Koordinaten werden die Einsatzkräfte navigiert."
								>Längengrad
							</nz-form-label>
							<nz-form-control>
								<nz-input-number
									formControlName="lat"
									[nzStep]="0.01"
									[nzMin]="-90"
									[nzMax]="90"
								/>
							</nz-form-control>
						</nz-form-item>
					</div>
					<div nz-col nzSpan="6">
						<nz-form-item>
							<nz-form-label
								nzTooltipTitle="Zu diesen Koordinaten werden die Einsatzkräfte navigiert!"
								>Breitengrad
							</nz-form-label>
							<nz-form-control>
								<nz-input-number
									[nzStep]="0.01"
									[nzMin]="-180"
									[nzMax]="180"
									formControlName="lon"
								/>
							</nz-form-control>
						</nz-form-item>
					</div>
				</ng-container>
				<ng-container formGroupName="address">
					<div nz-col nzSpan="12">
						<nz-form-item>
							<nz-form-label>Straße</nz-form-label>
							<nz-form-control
								[nzValidateStatus]="
									formGroup().controls.address.controls.street
								"
								nzErrorTip="Objektname oder Straße fehlt!"
							>
								<krd-geo-search
									field="street"
									formControlName="street"
									placeholder="Address-Suche"
									(resultSelected)="searchResultSelected($event)"
								/>
							</nz-form-control>
						</nz-form-item>
					</div>
					<div nz-col nzSpan="4">
						<nz-form-item>
							<nz-form-label>PLZ</nz-form-label>
							<nz-form-control>
								<input formControlName="postalCode" nz-input />
							</nz-form-control>
						</nz-form-item>
					</div>
					<div nz-col nzSpan="8">
						<nz-form-item>
							<nz-form-label>Stadt</nz-form-label>
							<nz-form-control>
								<input formControlName="city" nz-input />
							</nz-form-control>
						</nz-form-item>
					</div>
				</ng-container>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationLocationFormComponent implements OnDestroy {
	readonly formGroup = input.required<OperationLocationForm>();
	readonly focusInitially = input(false, {
		transform: (x: unknown) => booleanAttribute(x),
	});
	readonly formCompleted = output<void>();
	private nameGeoSearchEle = viewChild<GeoSearchComponent>('nameGeoSearch');
	private readonly destroyRefSubject$ = new Subject<void>();

	constructor() {
		effect(() => {
			this.destroyRefSubject$.next();

			if (this.focusInitially()) {
				setTimeout(() => {
					this.nameGeoSearchEle()?.focus();
				}, 0);
			}

			this.formGroup()
				.controls.coordinate.valueChanges.pipe(
					takeUntil(this.destroyRefSubject$),
				)
				.subscribe((coord) => {
					if ((coord.lat as unknown) === '') {
						this.formGroup().controls.coordinate.controls.lon.setValue(null);
					}
					if ((coord.lon as unknown) === '') {
						this.formGroup().controls.coordinate.controls.lon.setValue(null);
					}
				});
		});
	}

	ngOnDestroy(): void {
		this.destroyRefSubject$.next();
	}

	searchResultSelected(result: GeoSearchResult): void {
		this.formGroup().setValue({
			address: {
				...result.address,
				name: result.address.name ?? '',
			},
			coordinate: result.coordinate,
		});
		this.formCompleted.emit();
	}
}
