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
					<input nz-input formControlName="sender" required placeholder="Von" />
				</nz-form-control>
			</nz-form-item>
			<nz-form-item>
				<nz-form-control nzErrorTip="Empfänger benötigt!">
					<input
						nz-input
						formControlName="recipient"
						required
						placeholder="An"
					/>
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

	public messageForm = inject(NonNullableFormBuilder).group({
		sender: ['', Validators.required],
		recipient: ['', Validators.required],
		message: ['', Validators.required],
		channel: [
			this.channels.find((channel) => channel.default)?.value ?? '',
			Validators.required,
		],
	});

	private readonly client = inject(ProtocolClient);

	addProtocolMessage(): void {
		const formValue = this.messageForm.getRawValue();
		this.client.addMessageAsync({
			sender: {
				type: 'UNKNOWN_UNIT',
				name: formValue.sender,
			},
			recipient: {
				type: 'UNKNOWN_UNIT',
				name: formValue.recipient,
			},
			channel: formValue.channel,
			message: formValue.message,
		});
		this.messageForm.reset();
	}
}
