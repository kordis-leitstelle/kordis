import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	inject,
	signal,
	viewChild,
} from '@angular/core';
import {
	NonNullableFormBuilder,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { ProtocolClient } from '../../services/protocol.client';

@Component({
	selector: 'krd-create-protocol-message',
	imports: [
		NzButtonModule,
		NzFormModule,
		NzInputModule,
		NzPopoverDirective,
		NzSelectModule,
		ReactiveFormsModule,
	],
	template: `
		<div>
			<div
				nz-form
				nzLayout="inline"
				[formGroup]="validateForm"
				class="create-form"
			>
				<nz-form-item class="unit-input">
					<nz-form-control nzErrorTip="Absender benötigt!">
						<input
							formControlName="sender"
							nz-input
							required
							placeholder="Von"
						/>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item class="unit-input">
					<nz-form-control nzErrorTip="Empfänger benötigt!">
						<input
							formControlName="recipient"
							nz-input
							required
							placeholder="An"
							(keydown)="onRecipientKeyDown($event)"
						/>
					</nz-form-control>
				</nz-form-item>
				<nz-form-item class="channel-input">
					<nz-form-control nzErrorTip="Kanal benötigt">
						<nz-select formControlName="channel">
							@for (channel of channels; track channel.value) {
								<nz-option
									[nzValue]="channel.value"
									[nzLabel]="channel.label"
								/>
							}
						</nz-select>
					</nz-form-control>
				</nz-form-item>
				<button
					class="message-btn"
					nz-button
					nzType="primary"
					nz-popover
					nzPopoverTitle="Nachricht hinzufügen"
					[(nzPopoverVisible)]="messagePopoverVisible"
					nzPopoverTrigger="click"
					[nzPopoverContent]="messagePopover"
					[disabled]="validateForm.invalid"
				>
					Nachricht
				</button>
			</div>

			<!-- <div class='actions'>
				<div class='group'>
					<button nz-button nzType='primary' nzDanger>
						Neuer Einsatz
					</button>
					<button nz-button nzType='primary'>
						Einsatz beenden
					</button>
				</div>
				<div class='group'>
					<button nz-tooltip='Einheit zu einem laufenden Einsatz zuordnen' nz-button nzType='primary'>
						Einheit zuordnen
					</button>
					<button nz-tooltip='Einheit aus einem laufenden Einsatz rauslösen' nz-button nzType='primary'>
						Einheit rauslösen
					</button>
				</div>
				<div class='group'>
					<button nz-button nzType='primary'>
						RW ein-/nachmelden
					</button>
					<button nz-tooltip='RW an-/ab-/ummelden' nz-button nzType='primary'>
						RW ummelden
					</button>
				</div>
			</div> -->
		</div>

		<ng-template #messagePopover>
			<div nz-form nzLayout="inline">
				<nz-form-item>
					<input
						nz-input
						#messageInput
						(keydown)="onMessageKeyDown($event)"
						class="message-input"
					/>
				</nz-form-item>
				<nz-form-item>
					<button nz-button nzType="primary" (click)="addProtocolMessage()">
						Absenden
					</button>
				</nz-form-item>
			</div>
		</ng-template>
	`,
	styles: `
		.create-form {
			display: flex;
			padding: 0 var(--base-spacing);

			.unit-input {
				flex: 3;
			}

			.channel-input {
				flex: 2;
			}

			.message-btn {
				flex: 3;
			}
		}

		.actions {
			display: flex;
			gap: var(--base-spacing);

			.group {
				margin: 0 var(--base-spacing);
			}
		}

		.message-input {
			width: 300px;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProtocolMessageComponent {
	readonly channels = Object.freeze([
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
	readonly messagePopoverVisible = signal(false);
	validateForm = inject(NonNullableFormBuilder).group({
		sender: ['', Validators.required],
		recipient: ['', Validators.required],
		channel: [
			this.channels.find((channel) => channel.default)?.value ?? '',
			Validators.required,
		],
	});
	private readonly messageInput = viewChild<ElementRef>('messageInput');
	private readonly client = inject(ProtocolClient);

	onRecipientKeyDown($event: KeyboardEvent): void {
		if ($event.key === 'Tab' && this.validateForm.valid) {
			$event.preventDefault();
			this.messagePopoverVisible.set(true);
			setTimeout(() => this.messageInput()?.nativeElement.focus());
		}
	}

	onMessageKeyDown($event: KeyboardEvent): void {
		if ($event.key === 'Enter') {
			this.addProtocolMessage();
		}
	}

	addProtocolMessage(): void {
		const formValue = this.validateForm.getRawValue();
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
			message: this.messageInput()?.nativeElement.value,
		});
		this.validateForm.reset();
		this.messagePopoverVisible.set(false);
	}
}
