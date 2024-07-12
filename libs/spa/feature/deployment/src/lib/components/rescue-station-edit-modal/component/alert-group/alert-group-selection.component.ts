import {
	ChangeDetectionStrategy,
	Component,
	input,
	output,
	viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzIconDirective } from 'ng-zorro-antd/icon';

import { AlertGroup, Unit } from '@kordis/shared/model';

import { UnitsSelectComponent } from '../unit/units-select.component';

@Component({
	selector: 'krd-alert-group-selection',
	standalone: true,
	imports: [
		NzCardComponent,
		NzIconDirective,
		ReactiveFormsModule,
		UnitsSelectComponent,
	],
	template: `
		<div class="alert-group-header">
			<span>{{ formGroup().value.alertGroup!.name }}</span>
			<a nz-icon nzType="close" (click)="removeAlertGroup()"></a>
		</div>

		<krd-units-select [control]="formGroup().controls.assignedUnits" />
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
	readonly removed = output<void>();

	formGroup = input.required<
		FormGroup<{
			alertGroup: FormControl<AlertGroup>;
			assignedUnits: FormControl<Unit[]>;
		}>
	>();
	private unitSelectionEle = viewChild(UnitsSelectComponent);

	removeAlertGroup(): void {
		this.removed.emit();
	}

	focusUnitSelection(): void {
		this.unitSelectionEle()?.focus();
	}
}
