import {
	ChangeDetectionStrategy,
	Component,
	input,
	output,
	viewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
	NzFormControlComponent,
	NzFormItemComponent,
} from 'ng-zorro-antd/form';
import { NzIconDirective } from 'ng-zorro-antd/icon';

import { AlertGroup, Unit } from '@kordis/shared/model';

import { UnitSelectionOptionComponent } from '../unit/unit-selection-option.component';
import { UnitsSelectComponent } from '../unit/units-select.component';

@Component({
	selector: 'krd-alert-group-selection',
	imports: [
		NzFormControlComponent,
		NzFormItemComponent,
		NzIconDirective,
		UnitSelectionOptionComponent,
		UnitsSelectComponent,
	],
	template: `
		<div class="alert-group-header">
			<span>{{ formGroup().value.alertGroup!.name }}</span>
			<a nz-icon nzType="close" (click)="removeAlertGroup()"></a>
		</div>

		<nz-form-item>
			<nz-form-control [nzValidateStatus]="formGroup().controls.assignedUnits">
				<krd-units-select [control]="formGroup().controls.assignedUnits">
					<ng-template let-unit>
						<krd-unit-selection-option [unit]="unit" />
					</ng-template>
				</krd-units-select>
			</nz-form-control>
		</nz-form-item>
	`,
	styles: `
		.alert-group-header {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;

			span {
				font-weight: 500;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertGroupSelectionComponent {
	readonly formGroup = input.required<
		FormGroup<{
			alertGroup: FormControl<AlertGroup>;
			assignedUnits: FormControl<Unit[]>;
		}>
	>();
	readonly removed = output<void>();

	private readonly unitSelectionEle = viewChild(UnitsSelectComponent);

	removeAlertGroup(): void {
		this.removed.emit();
	}

	focusUnitSelection(): void {
		this.unitSelectionEle()?.focus();
	}
}
