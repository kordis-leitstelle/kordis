import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
} from '@angular/core';
import {
	FormArray,
	FormControl,
	FormGroup,
	NonNullableFormBuilder,
	ReactiveFormsModule,
} from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
	NzFormControlComponent,
	NzFormItemComponent,
} from 'ng-zorro-antd/form';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';

import { Unit } from '@kordis/shared/model';
import { DateMaskInputComponent } from '@kordis/spa/core/misc';

export type UnitInvolvementsFormArray = FormArray<
	FormGroup<{
		start: FormControl<Date | null>;
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
	imports: [
		CommonModule,
		DateMaskInputComponent,
		NzButtonComponent,
		NzFormControlComponent,
		NzFormItemComponent,
		NzIconDirective,
		NzTableModule,
		ReactiveFormsModule,
	],
	template: `
		<nz-table
			nzTemplateMode
			[nzFooter]="tableFooter"
			[nzShowPagination]="false"
			class="krd-small-table"
		>
			<thead>
				<tr>
					<th>Von</th>
					<th>Bis</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<ng-template #errorTplt let-control>
					@if (control.errors?.dateNotInPast) {
						Darf nicht in der Zukunft liegen!
					} @else if (control.errors?.outOfRange) {
						Liegt außerhalb der Einsatzzeit!
					} @else if (control.errors?.intersectingTimes) {
						Überschneidet sich mit anderen Zeiten!
					}
				</ng-template>
				@for (fg of formArray().controls; track $index) {
					<tr [formGroup]="fg">
						<td>
							<nz-form-control [nzErrorTip]="errorTplt">
								<krd-date-mask-input formControlName="start" size="small" />
							</nz-form-control>
						</td>
						<td>
							<nz-form-item>
								<nz-form-control [nzErrorTip]="errorTplt">
									<krd-date-mask-input formControlName="end" size="small" />
								</nz-form-control>
							</nz-form-item>
						</td>
						<td>
							<button
								data-testid="delete-involvement"
								nz-button
								nzType="link"
								(click)="removeInvolvementTime($index)"
								[disabled]="formArray().length <= 1 || formArray().disabled"
							>
								<span nz-icon nzType="delete" nzTheme="outline"></span>
							</button>
						</td>
					</tr>
				} @empty {
					<tr>
						<td colspan="3">Keine Zeiten vorhanden</td>
					</tr>
				}
			</tbody>
		</nz-table>

		<ng-template #tableFooter>
			<button
				nz-button
				nzSize="small"
				nzType="default"
				(click)="addInvolvementTime()"
				[disabled]="
					(this.formArray().length > 0 &&
						this.formArray().controls[this.formArray().length - 1].controls.end
							.value === null) ||
					formArray().disabled
				"
				data-testid="add-involvement-time"
			>
				<span nz-icon nzType="plus" nzTheme="outline"></span>
				Zeit hinzufügen
			</button>
		</ng-template>
	`,
	styles: `
		nz-table {
			td {
				vertical-align: top;
			}

			td:last-child {
				text-align: center;
			}
		}

		nz-form-control {
			.ant-form-item-explain-connected {
				height: 100%;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationUnitInvolvementTimesComponent {
	readonly formArray = input.required<UnitInvolvementsFormArray>();
	private readonly fb = inject(NonNullableFormBuilder);

	removeInvolvementTime(index: number): void {
		this.formArray().removeAt(index);
		this.formArray().updateValueAndValidity();
	}

	addInvolvementTime(): void {
		this.formArray().push(
			this.fb.group({
				start: this.fb.control<Date | null>(null),
				end: this.fb.control<Date | null>(null),
			}),
			{
				emitEvent: false,
			},
		);
	}
}
