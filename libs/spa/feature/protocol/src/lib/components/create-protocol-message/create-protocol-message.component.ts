import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { UnitAutocompleteComponent } from '@kordis/spa/core/ui';

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
		UnitAutocompleteComponent,
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
					<krd-unit-autocomplete nz-input formControlName="sender" />
				</nz-form-control>
			</nz-form-item>
			<nz-form-item>
				<nz-form-control nzErrorTip="Empfänger benötigt!">
					<krd-unit-autocomplete nz-input formControlName="recipient" />
				</nz-form-control>
			</nz-form-item>
			<nz-form-item class="message-input">
				<input
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
	`,
	styles: `
		.message-input {
			flex-grow: 1;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProtocolMessageComponent {
	readonly channels = CHANNELS;

	private readonly fb = inject(NonNullableFormBuilder);
	public messageForm = this.fb.group({
		sender: this.fb.control<Unit | undefined>(undefined, Validators.required),
		recipient: this.fb.control<Unit | undefined>(
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
		this.messageForm.reset();
	}

	private generateUnitInput(unit: Unit): UnitInput {
		return {
			type: 'REGISTERED_UNIT',
			id: unit.id,
		};
	}
}
