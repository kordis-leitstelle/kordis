import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	effect,
	input,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
	InfoCircleOutline,
	WarningOutline,
} from '@ant-design/icons-angular/icons';
import {
	NzCollapseComponent,
	NzCollapsePanelComponent,
} from 'ng-zorro-antd/collapse';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { Subject, filter, takeUntil } from 'rxjs';

import { Unit } from '@kordis/shared/model';

import { OperationUnitInvolvementTimesComponent } from './operation-unit-involvement-times.component';

export type UnitInvolvementFormGroup = FormGroup<{
	unit: FormControl<Unit>;
	isPending: FormControl<boolean>;
	involvementTimes: FormArray<
		FormGroup<{
			start: FormControl<Date>;
			end: FormControl<Date | null>;
		}>
	>;
}>;

@Component({
	selector: 'krd-operation-unit-involvements-form',
	standalone: true,
	imports: [
		NzCollapseComponent,
		NzCollapsePanelComponent,
		NzIconDirective,
		NzTooltipDirective,
		OperationUnitInvolvementTimesComponent,
	],
	template: `
		<nz-collapse [nzBordered]="false">
			@for (control of formArray().controls; track control.value.unit!.id) {
				<ng-template #header>
					<div class="header">
						<span
							>{{ control.value.unit!.callSign }} -
							{{ control.value.unit!.name }}</span
						>
						@if (control.errors) {
							<span
								class="error"
								nz-icon
								nzType="warning"
								nzTheme="outline"
								[nz-tooltip]="
									control.errors.outOfRange
										? 'Die Zeiten überschneiden sich mit der Einsatzzeit.'
										: 'Die Zeiten der Einheit überschneiden sich.'
								"
							></span>
						}
					</div>
				</ng-template>
				<nz-collapse-panel [nzHeader]="header">
					@if (control.controls.involvementTimes.length > 0) {
						<krd-operation-unit-involvement-times
							[formArray]="control.controls.involvementTimes"
						/>
					}
					@if (control.value.isPending) {
						<div
							class="pending-note"
							nz-tooltip="Die Einheit wurde diesem Einsatz zugeordnet, hat aber noch keinen Status (3 oder 4) abgegeben."
							[nzTooltipOrigin]="$any(pendingNote)"
						>
							<span nz-icon nzType="info-circle" nzTheme="outline"></span>
							<i #pendingNote>Diese Einheit hat eine ausstehende Zuordnung!</i>
						</div>
					}
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
				padding: 0 !important;

				.pending-note {
					margin: 5px;
					font-style: italic;
					display: flex;
					gap: 5px;
				}
			}
		}

		.header {
			display: flex;
			justify-content: space-between;
			margin-right: 10px;

			.error {
				color: var(--ant-error-color);
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationInvolvementsFormComponent implements OnDestroy {
	readonly formArray = input.required<FormArray<UnitInvolvementFormGroup>>();

	private readonly cleanupSubject$ = new Subject<void>();

	constructor(nzIconService: NzIconService) {
		nzIconService.addIcon(WarningOutline, InfoCircleOutline);

		effect(() => {
			this.cleanupSubject$.next();
			// Subscribe to each involvement change, to delete an empty involvement of a non-pending unit
			this.formArray().controls.forEach((fg) => {
				fg.controls.involvementTimes.valueChanges
					.pipe(
						filter(
							(involvementTimes) =>
								involvementTimes.length === 0 && !fg.value.isPending,
						),
						takeUntil(this.cleanupSubject$),
					)
					.subscribe(() =>
						this.formArray().removeAt(this.formArray().controls.indexOf(fg)),
					);
			});
		});
	}

	ngOnDestroy(): void {
		this.cleanupSubject$.next();
	}
}
