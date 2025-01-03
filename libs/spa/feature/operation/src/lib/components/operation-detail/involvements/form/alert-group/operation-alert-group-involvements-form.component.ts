import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
	NzCollapseComponent,
	NzCollapsePanelComponent,
} from 'ng-zorro-antd/collapse';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';

import { AlertGroup } from '@kordis/shared/model';

import {
	OperationInvolvementsFormComponent,
	UnitInvolvementFormGroup,
} from '../unit/operation-unit-involvements-form.component';

export type AlertGroupInvolvementFormGroup = FormGroup<{
	alertGroup: FormControl<AlertGroup>;
	unitInvolvements: FormArray<UnitInvolvementFormGroup>;
}>;

@Component({
	selector: 'krd-operation-alert-group-involvement-form',
	standalone: true,
	imports: [
		CommonModule,
		NzCollapseComponent,
		NzCollapsePanelComponent,
		NzNoAnimationDirective,
		OperationInvolvementsFormComponent,
	],
	template: `
		<nz-collapse [nzBordered]="false">
			@for (
				control of formArray().controls;
				track control.value.alertGroup!.id
			) {
				<nz-collapse-panel [nzHeader]="control.value.alertGroup!.name">
					<krd-operation-unit-involvements-form
						[formArray]="control.controls.unitInvolvements"
					/>
				</nz-collapse-panel>
			}
		</nz-collapse>
	`,
	styles: `
		nz-collapse {
			width: 100%;

			.ant-collapse-header {
				padding: 6px !important;
			}

			.ant-collapse-content-box {
				padding: 5px !important;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationUAlertGroupInvolvementsFormComponent {
	readonly formArray =
		input.required<FormArray<AlertGroupInvolvementFormGroup>>();
}
