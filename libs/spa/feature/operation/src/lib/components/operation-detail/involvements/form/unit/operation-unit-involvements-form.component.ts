import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	effect,
	inject,
	input,
	output,
} from '@angular/core';
import {
	FormArray,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
} from '@angular/forms';
import {
	InfoCircleOutline,
	WarningOutline,
} from '@ant-design/icons-angular/icons';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
	NzCollapseComponent,
	NzCollapsePanelComponent,
} from 'ng-zorro-antd/collapse';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { Subject, distinctUntilChanged, filter, map, takeUntil } from 'rxjs';

import { Unit } from '@kordis/shared/model';
import {
	AutocompleteComponent,
	AutocompleteOptionTemplateDirective,
	PossibleUnitSelectionsService,
	UnitOptionComponent,
} from '@kordis/spa/core/ui';

import { OperationUnitInvolvementTimesComponent } from './operation-unit-involvement-times.component';

export type UnitInvolvementFormGroup = FormGroup<{
	unit: FormControl<Unit>;
	isPending: FormControl<boolean>;
	involvementTimes: FormArray<
		FormGroup<{
			start: FormControl<Date | null>;
			end: FormControl<Date | null>;
		}>
	>;
}>;

@Component({
	selector: 'krd-operation-unit-involvements-form',
	imports: [
		NzCollapseComponent,
		NzCollapsePanelComponent,
		NzIconDirective,
		NzTooltipDirective,
		OperationUnitInvolvementTimesComponent,
		NzAlertComponent,
		NzPopoverDirective,
		NzButtonComponent,
		ReactiveFormsModule,
		AsyncPipe,
		AutocompleteComponent,
		AutocompleteOptionTemplateDirective,
		UnitOptionComponent,
	],
	template: `
		@if (formArray().length > 0) {
			<nz-collapse>
				@for (
					control of formArray().controls;
					track control.value.unit!.id;
					let i = $index
				) {
					<ng-template #header>
						<div class="header">
							<span
								>{{ control.value.unit!.callSign }} -
								{{ control.value.unit!.name }}</span
							>

							<div>
								@if (control.invalid) {
									<span
										class="error-icon"
										nz-icon
										nzType="warning"
										nzTheme="outline"
										nz-tooltip="Die Zeiten der Einheit weisen Fehler auf!"
									></span>
								}
								<button
									nz-button
									nzSize="small"
									nzType="link"
									(click)="
										deleteUnit.emit({ unit: control.value.unit!, index: i })
									"
									[disabled]="control.disabled"
								>
									<span nz-icon nzTheme="outline" nzType="delete"></span>
								</button>
							</div>
						</div>
					</ng-template>
					<nz-collapse-panel [nzHeader]="header">
						@if (control.value.isPending) {
							<div class="pending-note-container">
								<nz-alert
									nzType="info"
									nzShowIcon
									nzMessage="Diese Einheit hat eine ausstehende Zuordnung!"
									nz-tooltip="Die Einheit wurde diesem Einsatz zugeordnet, hat aber noch keinen Einsatz-Status (3 oder 4) abgegeben."
								/>
							</div>
						}

						<krd-operation-unit-involvement-times
							[formArray]="control.controls.involvementTimes"
						/>
					</nz-collapse-panel>
				}
			</nz-collapse>
		}

		<div class="footer">
			<ng-template #addUnitPopover>
				<krd-autocomplete
					[labelFn]="labelFn"
					[options]="
						(unitSelectionsService.allPossibleEntitiesToSelect$ | async) ?? []
					"
					[formControl]="unitControl"
					[searchFields]="['callSign', 'name', 'callSignAbbreviation']"
				>
					<ng-template
						krdAutocompleteOptionTmpl
						[list]="
							(unitSelectionsService.allPossibleEntitiesToSelect$ | async) ?? []
						"
						let-unit
					>
						<krd-unit-option [unit]="unit" />
					</ng-template>
				</krd-autocomplete>
			</ng-template>

			<button
				[nzPopoverContent]="addUnitPopover"
				data-testid="add-unit-involvement"
				nz-button
				nz-popover
				nzPopoverTitle="Einheiten hinzufügen"
				nzPopoverTrigger="click"
				nzSize="small"
				nzType="default"
				[disabled]="formArray().disabled"
			>
				<span nz-icon nzTheme="outline" nzType="plus"></span>
				Einheit hinzufügen
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
				padding: 0 !important;

				.pending-note-container {
					padding: calc(var(--base-spacing) / 2);
					.ant-alert {
						padding-top: calc(var(--base-spacing) / 2);
						padding-bottom: calc(var(--base-spacing) / 2);
					}
				}
			}
		}

		.error-icon {
			color: var(--ant-error-color);
		}

		.header {
			display: flex;
			justify-content: space-between;
		}

		.footer {
			padding-top: calc(var(--base-spacing) / 2);
			display: flex;
			justify-content: flex-end;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationInvolvementsFormComponent implements OnDestroy {
	readonly formArray = input.required<FormArray<UnitInvolvementFormGroup>>();
	readonly addUnit = output<Unit>();
	readonly deleteUnit = output<{ unit: Unit; index: number }>();
	readonly unitSelectionsService = inject(PossibleUnitSelectionsService);
	readonly labelFn = (unit: Unit): string => unit.callSign;

	readonly unitControl = new FormControl<Unit | null>(null);

	private readonly cleanupSubject$ = new Subject<void>();

	constructor(nzIconService: NzIconService, cd: ChangeDetectorRef) {
		nzIconService.addIcon(WarningOutline, InfoCircleOutline);

		effect(() => {
			this.cleanupSubject$.next();

			this.formArray()
				.valueChanges.pipe(
					// only trigger change detection if the length of the involvements changes (external add)
					map((v) => v.length),
					distinctUntilChanged(),
					takeUntil(this.cleanupSubject$),
				)
				.subscribe(() => cd.detectChanges());
		});

		this.unitControl.valueChanges
			.pipe(filter((unit) => !!unit))
			.subscribe((unit) => {
				this.addUnit.emit(unit);
				this.unitControl.reset();
			});
	}

	ngOnDestroy(): void {
		this.cleanupSubject$.next();
	}
}
