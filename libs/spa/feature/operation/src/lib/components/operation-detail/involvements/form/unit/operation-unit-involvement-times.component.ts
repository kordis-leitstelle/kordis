import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	effect,
	inject,
	input,
} from '@angular/core';
import {
	FormArray,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
} from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import {
	NzFormControlComponent,
	NzFormItemComponent,
} from 'ng-zorro-antd/form';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzListItemComponent } from 'ng-zorro-antd/list';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { Unit } from '@kordis/shared/model';

export type UnitInvolvementsFormArray = FormArray<
	FormGroup<{
		start: FormControl<Date>;
		end: FormControl<Date | null>;
	}>
>;

export type UnitInvolvementFormGroup = FormGroup<{
	unit: FormControl<Unit>;
	isPending: FormControl<boolean>;
	involvementTimes: UnitInvolvementsFormArray;
}>;

@Component({
	selector: 'krd-operation-unit-involvement-times',
	standalone: true,
	imports: [
		CommonModule,
		NzButtonComponent,
		NzDatePickerComponent,
		NzIconDirective,
		NzListItemComponent,
		NzNoAnimationDirective,
		NzTooltipDirective,
		ReactiveFormsModule,
		NzTableModule,
		NzFormItemComponent,
		NzFormControlComponent,
	],
	template: `
		<nz-table nzTemplateMode [nzShowPagination]="false" nzSize="small">
			<thead>
				<tr>
					<th>Von</th>
					<th>Bis</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				@for (fg of formArray().controls; track $index) {
					<tr [formGroup]="fg">
						<td>
							<nz-form-item>
								<nz-form-control>
									<nz-date-picker
										nzNoAnimation
										nzShowTime
										nzFormat="dd.MM.yyy HH:mm:ss"
										formControlName="start"
										nzAllowClear="false"
										nzSize="small"
									/>
								</nz-form-control>
							</nz-form-item>
						</td>
						<td>
							<nz-form-item>
								<nz-form-control [nzErrorTip]="passwordErrorTpl">
									<nz-date-picker
										nzNoAnimation
										nzShowTime
										nzFormat="dd.MM.yyy HH:mm:ss"
										formControlName="end"
										nzSize="small"
										nzPlaceHolder="Kein Ende"
									/>
									<ng-template #passwordErrorTpl let-control>
										@if (control.errors?.dateNotInPast) {
											Darf nicht in der Zukunft liegen!
										}
										@if (control.errors?.['confirm']) {
											Password is inconsistent!
										}
									</ng-template>
								</nz-form-control>
							</nz-form-item>
						</td>
						<td class="delete">
							<button
								data-testid="delete-involvement"
								nz-button
								nzType="link"
								(click)="removeInvolvement($index)"
							>
								<span nz-icon nzType="delete" nzTheme="outline"></span>
							</button>
						</td>
					</tr>
				}
			</tbody>
		</nz-table>
	`,
	styles: `
		nz-table {
			th {
				padding: 0 8px !important;
			}

			tr:hover > td {
				background: unset;
			}

			tr td:last-child {
				padding: 0 !important;
			}

			.delete {
				display: flex;
				align-content: center;
				justify-content: center;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationUnitInvolvementTimesComponent {
	readonly formArray = input.required<UnitInvolvementsFormArray>();
	cd = inject(ChangeDetectorRef);

	constructor() {
		effect(() => {
			this.formArray().statusChanges.subscribe(() => this.cd.detectChanges());
		});
	}

	removeInvolvement(index: number): void {
		this.formArray().removeAt(index);
	}
}
