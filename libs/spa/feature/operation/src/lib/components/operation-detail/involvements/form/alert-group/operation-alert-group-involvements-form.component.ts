import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	input,
	output,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';

import { AlertGroup, Unit } from '@kordis/shared/model';
import { AlertGroupAutocompleteComponent } from '@kordis/spa/core/ui';

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
		NzCollapseModule,
		OperationInvolvementsFormComponent,
		AlertGroupAutocompleteComponent,
		NzButtonComponent,
		NzIconDirective,
		NzPopoverDirective,
	],
	template: `
		@if (formArray().length > 0) {
			<nz-collapse>
				@for (
					control of formArray().controls;
					track control.value.alertGroup!.id
				) {
					<nz-collapse-panel [nzHeader]="control.value.alertGroup!.name">
						<krd-operation-unit-involvements-form
							[formArray]="control.controls.unitInvolvements"
							(addUnit)="
								addAlertGroupUnit.emit({
									unit: $event,
									alertGroup: control.value.alertGroup!,
								})
							"
						/>
					</nz-collapse-panel>
				}
			</nz-collapse>
		}

		<div class="footer">
			<ng-template #addAlertGroupPopover>
				<krd-alert-group-autocomplete (selected)="addAlertGroup.emit($event)" />
			</ng-template>
			<button
				[nzPopoverContent]="addAlertGroupPopover"
				data-testid="add-alert-group-involvement"
				nz-button
				nz-popover
				nzPopoverTitle="Alarmgruppe hinzufügen"
				nzPopoverTrigger="click"
				nzSize="small"
				nzType="default"
			>
				<span nz-icon nzTheme="outline" nzType="plus"></span>
				Alarmgruppe hinzufügen
			</button>
		</div>
	`,
	styles: `
		nz-collapse {
			width: 100%;

			.ant-collapse-header {
				padding: calc(var(--base-spacing) / 2) !important;
			}

			.ant-collapse-content-box {
				padding: calc(var(--base-spacing) / 4) !important;
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
export class OperationUAlertGroupInvolvementsFormComponent {
	readonly formArray =
		input.required<FormArray<AlertGroupInvolvementFormGroup>>();

	readonly addAlertGroup = output<AlertGroup>();
	readonly addAlertGroupUnit = output<{
		unit: Unit;
		alertGroup: AlertGroup;
	}>();
}
