import { JsonPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject,
	signal,
} from '@angular/core';
import {
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { Unit, UnitInput } from '@kordis/shared/model';
import {
	AutocompleteComponent,
	AutocompleteOptionTemplateDirective,
	PossibleUnitSelectionsService,
	UnitOptionComponent,
} from '@kordis/spa/core/ui';

import { ProtocolClient } from '../../services/protocol.client';

const CHANNELS = Object.freeze([
	{
		value: 'D',
		label: 'Digital',
		default: true,
	},
	{
		value: 'T',
		label: 'Telefon',
		default: false,
	},
	{
		value: '1',
		label: 'DLRG-Kanal 1',
		default: false,
	},
	{
		value: '2',
		label: 'DLRG-Kanal 2',
		default: false,
	},
	{
		value: '3',
		label: 'DLRG-Kanal 3',
		default: false,
	},
]);

@Component({
	selector: 'krd-create-protocol-message',
	imports: [
		NzButtonModule,
		NzFormModule,
		NzInputModule,
		NzSelectModule,
		ReactiveFormsModule,
		JsonPipe,
		AutocompleteComponent,
		AutocompleteOptionTemplateDirective,
		UnitOptionComponent,
	],
	template: `
		<form
			nz-form
			nzLayout="inline"
			[formGroup]="messageForm"
			(submit)="addProtocolMessage()"
		>
			<nz-form-item>
				<nz-form-control nzErrorTip="Absender benötigt!">
					<krd-autocomplete
						[labelFn]="labelFn"
						[options]="units()"
						formControlName="sender"
						[searchFields]="['callSign', 'name', 'callSignAbbreviation']"
						(optionSelected)="recipientInput.focus()"
						placeholder="Von"
						allowCustomValues
						selectOnBlur
					>
						<ng-template krdAutocompleteOptionTmpl [list]="units()" let-unit>
							<krd-unit-option [unit]="unit" />
						</ng-template>
					</krd-autocomplete>
				</nz-form-control>
			</nz-form-item>
			<nz-form-item>
				<nz-form-control nzErrorTip="Empfänger benötigt!">
					<krd-autocomplete
						#recipientInput
						[labelFn]="labelFn"
						[options]="units()"
						formControlName="recipient"
						[searchFields]="['callSign', 'name', 'callSignAbbreviation']"
						placeholder="An"
						allowCustomValues
						selectOnBlur
						(optionSelected)="msgInput.focus()"
					>
						<ng-template krdAutocompleteOptionTmpl [list]="units()" let-unit>
							<krd-unit-option [unit]="unit" />
						</ng-template>
					</krd-autocomplete>
				</nz-form-control>
			</nz-form-item>
			<nz-form-item class="message-input">
				<input
					#msgInput
					nz-input
					formControlName="message"
					required
					placeholder="Nachricht"
				/>
			</nz-form-item>
			<nz-form-item>
				<nz-form-control nzErrorTip="Kanal benötigt">
					<nz-select formControlName="channel">
						@for (channel of channels; track channel.value) {
							<nz-option [nzValue]="channel.value" [nzLabel]="channel.label" />
						}
					</nz-select>
				</nz-form-control>
			</nz-form-item>
			<button
				nz-button
				nzType="primary"
				(click)="addProtocolMessage()"
				[disabled]="messageForm.invalid"
			>
				Gespräch eintragen
			</button>
		</form>
		<pre>{{ messageForm.value | json }}</pre>
	`,
	styles: `
		.message-input {
			flex-grow: 1;
		}

		.call-sign {
			font-weight: 500;
			margin-right: var(--base-spacing);
		}

		.name {
			color: grey;
			font-size: 0.9em;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProtocolMessageComponent implements OnInit {
	readonly channels = CHANNELS;
	readonly labelFn = (unit: Unit): string => unit.callSign;

	private readonly unitService = inject(PossibleUnitSelectionsService);
	readonly units = signal<Unit[]>([]);

	private readonly fb = inject(NonNullableFormBuilder);
	public messageForm = this.fb.group({
		sender: this.fb.control<Unit | string | undefined>(
			undefined,
			Validators.required,
		),
		recipient: this.fb.control<Unit | string | undefined>(
			undefined,
			Validators.required,
		),
		message: this.fb.control<string>('', Validators.required),
		channel: this.fb.control<string>(
			this.channels.find((channel) => channel.default)?.value ?? '',
			Validators.required,
		),
	});

	private readonly client = inject(ProtocolClient);

	ngOnInit(): void {
		this.unitService.allPossibleEntitiesToSelect$.subscribe((units) => {
			this.units.set(units);
		});
	}

	addProtocolMessage(): void {
		const formValue = this.messageForm.getRawValue();

		// checking presence of sender and recipient is necessary for type inference
		if (this.messageForm.invalid || !formValue.sender || !formValue.recipient) {
			return;
		}

		this.client.addMessageAsync({
			sender: this.generateUnitInput(formValue.sender),
			recipient: this.generateUnitInput(formValue.recipient),
			channel: formValue.channel,
			message: formValue.message,
		});

		const defaultChannel =
			this.channels.find((channel) => channel.default)?.value ?? '';

		// Use setTimeout to push reset to the next change detection cycle
		setTimeout(() => {
			// Reset with default values
			this.messageForm.reset({
				sender: undefined,
				recipient: undefined,
				message: '',
				channel: defaultChannel,
			});

			// Mark form controls as pristine and untouched
			this.messageForm.markAsPristine();
			this.messageForm.markAsUntouched();
		}, 0);
	}

	private generateUnitInput(unit: Unit | string): UnitInput {
		if (typeof unit === 'string') {
			return {
				type: 'UNKNOWN_UNIT',
				name: unit,
			};
		}
		return {
			type: 'REGISTERED_UNIT',
			id: unit.id,
		};
	}
}
