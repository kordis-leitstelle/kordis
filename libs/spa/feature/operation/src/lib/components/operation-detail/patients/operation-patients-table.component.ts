import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	effect,
	inject,
	input,
} from '@angular/core';
import { FormArray, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Subject, takeUntil } from 'rxjs';

import { markInvalidFormControlsAsDirty } from '@kordis/spa/core/misc';

import { OperationPatientDataFormComponent } from './operation-patient-data-form.component';
import { PatientFormGroup } from './operation-patients.component';

@Component({
	selector: 'krd-operation-patients-table',
	imports: [
		CommonModule,
		NzButtonComponent,
		NzIconDirective,
		NzTableModule,
		OperationPatientDataFormComponent,
	],
	templateUrl: `./operation-patients-table.component.html`,
	styles: `
		nz-table {
			.ant-table-expanded-row {
				padding: calc(var(--base-spacing) / 2);
			}
		}

		.footer {
			padding-top: calc(var(--base-spacing) / 2);
			display: flex;
			justify-content: flex-end;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationPatientsTableComponent implements OnDestroy {
	formArray = input.required<FormArray<PatientFormGroup>>();

	expendedRow = -1;

	private readonly fb = inject(NonNullableFormBuilder);
	private readonly cleanupSubject$ = new Subject<void>();

	constructor(cd: ChangeDetectorRef) {
		effect(() => {
			this.cleanupSubject$.next();

			this.formArray()
				.valueChanges.pipe(takeUntil(this.cleanupSubject$))
				.subscribe(() => cd.detectChanges());
		});
	}

	ngOnDestroy(): void {
		this.cleanupSubject$.next();
		this.cleanupSubject$.complete();
	}

	onExpandChange(id: number, checked: boolean): void {
		this.expendedRow = checked ? id : -1;
	}

	addPatient(): void {
		const fg = this.makePatientFormGroup();
		this.formArray().push(fg);
		markInvalidFormControlsAsDirty(fg); // initially show errors
		this.onExpandChange(this.formArray().length - 1, true);
	}

	removePatient(index: number): void {
		this.formArray().removeAt(index);
	}

	private makePatientFormGroup(): PatientFormGroup {
		return this.fb.group({
			firstName: this.fb.control(''),
			lastName: this.fb.control('', Validators.required),
			birthDate: this.fb.control<Date | null>(null),
			phoneNumber: this.fb.control(''),
			whereabouts: this.fb.control('', Validators.required),
			address: this.fb.group({
				street: this.fb.control(''),
				city: this.fb.control(''),
				postalCode: this.fb.control(''),
			}),
		});
	}
}
