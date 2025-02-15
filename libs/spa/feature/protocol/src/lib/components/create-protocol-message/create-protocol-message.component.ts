import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import {
	FormControl,
	FormGroup,
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { MutationCreateCommunicationMessageArgs } from '@kordis/shared/model';

@Component({
	selector: 'krd-create-protocol-message',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		NzFormModule,
		NzInputModule,
		NzSelectModule,
		NzButtonModule,
	],
	template: `
		<div style="background-color: green">
			<form
				nz-form
				[nzLayout]="'inline'"
				[formGroup]="validateForm"
				(ngSubmit)="submitForm()"
				class="create-form"
			>
				<nz-form-item>
					<nz-form-control nzErrorTip="Absender benötigt!">
						<input
							formControlName="sender"
							nz-input
							required
							placeholder="Von"
						/>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item>
					<nz-form-control nzErrorTip="Empfänger benötigt!">
						<input
							formControlName="recipient"
							nz-input
							required
							placeholder="An"
						/>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item class="message">
					<nz-form-control nzErrorTip="Nachricht benötigt!">
						<input
							formControlName="message"
							nz-input
							required
							placeholder="Nachricht"
						/>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item class="channel">
					<nz-form-control ngErrorTip="Kanal benötigt">
						<nz-select formControlName="channel">
							@for (channel of channels; track channel.value) {
								<nz-option
									[nzValue]="channel.value"
									[nzLabel]="channel.label"
								></nz-option>
							}
						</nz-select>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item>
					<nz-form-control>
						<button nz-button nzType="primary" [disabled]="!validateForm.valid">
							Eintragen
						</button>
					</nz-form-control>
				</nz-form-item>
			</form>
		</div>
	`,
	styles: `
		.create-form {
			width: 100%;
			display: flex;

			.message {
				flex-grow: 1;
			}

			.channel {
				min-width: 10em;
			}

			:last-child {
				margin-right: 0;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProtocolMessageComponent {
	// TODO: move to backend
	channels = [
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
	];
	newMessage = output<MutationCreateCommunicationMessageArgs>();

	validateForm: FormGroup<{
		sender: FormControl<string>;
		recipient: FormControl<string>;
		message: FormControl<string>;
		channel: FormControl<string>;
	}> = this.fb.group({
		sender: ['', [Validators.required]],
		recipient: ['', [Validators.required]],
		message: ['', [Validators.required]],
		channel: [
			this.channels.find((channel) => channel.default)?.value ?? '',
			[Validators.required],
		],
	});

	constructor(private fb: NonNullableFormBuilder) {}

	submitForm(): void {
		const formValue = this.validateForm.value;

		this.newMessage.emit({
			sender: { type: 'UNKNOWN_UNIT', name: formValue.sender },
			recipient: { type: 'UNKNOWN_UNIT', name: formValue.recipient },
			message: formValue.message ?? '', // TODO: make sure not empty
			channel: formValue.channel ?? 'D', // TODO: make sure not empty
		});

		this.validateForm.reset();
	}
}
