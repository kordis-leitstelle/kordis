import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	effect,
	inject,
	input,
	output,
	viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
	NzFormControlComponent,
	NzFormItemComponent,
} from 'ng-zorro-antd/form';
import { NzColDirective } from 'ng-zorro-antd/grid';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { Subject, takeUntil } from 'rxjs';

import { Unit } from '@kordis/shared/model';
import {
	AutocompleteComponent,
	AutocompleteOptionTemplateDirective,
	PossibleUnitSelectionsService,
	UnitOptionComponent,
} from '@kordis/spa/core/ui';

import { CHANNELS } from '../../channels';
import { ensureSingleUnitSelectionPipe } from '../../services/ensure-single-unit.pipe';

export type ProtocolCommunicationDetailsFormGroup = FormGroup<{
	sender: FormControl<Unit | string>;
	recipient: FormControl<Unit | string>;
	channel: FormControl<string>;
}>;

@Component({
	selector: 'krd-protocol-communication-details',
	imports: [
		AsyncPipe,
		AutocompleteComponent,
		AutocompleteOptionTemplateDirective,
		NzColDirective,
		NzFormControlComponent,
		NzFormItemComponent,
		NzOptionComponent,
		NzSelectComponent,
		ReactiveFormsModule,
		UnitOptionComponent,
	],
	template: `
		@let selectableUnits =
			(unitSelectionsService.allPossibleEntitiesToSelect$ | async) ?? [];
		<div class="form" [formGroup]="formGroup()">
			<nz-form-item class="unit-input">
				<nz-form-control nzErrorTip="Absender benötigt!">
					<krd-autocomplete
						[labelFn]="labelFn"
						[options]="selectableUnits"
						formControlName="sender"
						[searchFields]="['callSign', 'name', 'callSignAbbreviation']"
						placeholder="Von"
						[dropdownWidth]="250"
						allowCustomValues
						selectOnBlur
					>
						<ng-template
							krdAutocompleteOptionTmpl
							[list]="selectableUnits"
							let-unit
						>
							<krd-unit-option [unit]="unit" />
						</ng-template>
					</krd-autocomplete>
				</nz-form-control>
			</nz-form-item>
			<nz-form-item class="unit-input">
				<nz-form-control nzErrorTip="Empfänger benötigt!">
					<krd-autocomplete
						#recipientInput
						[labelFn]="labelFn"
						[options]="selectableUnits"
						formControlName="recipient"
						[searchFields]="['callSign', 'name', 'callSignAbbreviation']"
						placeholder="An"
						[dropdownWidth]="250"
						allowCustomValues
						selectOnBlur
					>
						<ng-template
							krdAutocompleteOptionTmpl
							[list]="selectableUnits"
							let-unit
						>
							<krd-unit-option [unit]="unit" />
						</ng-template>
					</krd-autocomplete>
				</nz-form-control>
			</nz-form-item>
			<nz-form-item class="channel-input">
				<nz-form-control nzErrorTip="Kanal benötigt">
					<nz-select formControlName="channel">
						@for (channel of channels; track channel.value) {
							<nz-option [nzValue]="channel.value" [nzLabel]="channel.label" />
						}
					</nz-select>
				</nz-form-control>
			</nz-form-item>
		</div>
	`,
	styles: `
		.form {
			display: flex;
			gap: var(--base-spacing);

			.unit-input {
				flex: 3;
			}

			.channel-input {
				flex: 2;
			}
		}
	`,
	providers: [PossibleUnitSelectionsService],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolCommunicationDetailsComponent {
	readonly formGroup = input.required<ProtocolCommunicationDetailsFormGroup>();
	readonly recipientSet = output<void>();
	readonly labelFn = (unit: Unit): string => unit.callSign;
	readonly unitSelectionsService = inject(PossibleUnitSelectionsService);

	protected readonly channels = CHANNELS;

	private readonly recipientInput =
		viewChild<HTMLInputElement>('recipientInput');

	constructor() {
		const destroySubject$ = new Subject<void>();
		effect(() => {
			destroySubject$.next();
			this.formGroup()
				.controls.sender.valueChanges.pipe(
					ensureSingleUnitSelectionPipe(this.unitSelectionsService),
					takeUntil(destroySubject$),
				)
				.subscribe(() => setTimeout(() => this.recipientInput()?.focus()));

			this.formGroup()
				.controls.recipient.valueChanges.pipe(
					ensureSingleUnitSelectionPipe(this.unitSelectionsService),
					takeUntil(destroySubject$),
				)
				.subscribe(() => setTimeout(() => this.recipientSet.emit()));
		});
	}
}
