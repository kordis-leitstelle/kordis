import { AsyncPipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	inject,
	output,
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
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { Unit, UnitInput } from '@kordis/shared/model';
import {
	AutocompleteComponent,
	AutocompleteOptionTemplateDirective,
	PossibleUnitSelectionsService,
	UnitOptionComponent,
} from '@kordis/spa/core/ui';

import { CHANNELS, DEFAULT_CHANNEL } from '../../channels';
import { ensureSingleUnitSelectionPipe } from '../../services/ensure-single-unit.pipe';

@Component({
	selector: 'krd-create-protocol-message',
	imports: [
		NzButtonModule,
		NzFormModule,
		NzInputModule,
		NzSelectModule,
		ReactiveFormsModule,
		NzIconModule,
		AutocompleteComponent,
		UnitOptionComponent,
		AutocompleteOptionTemplateDirective,
		AsyncPipe,
	],
	templateUrl: `./create-protocol-message.component.html`,
	styles: `
		.form {
			display: grid;
			grid-template-columns: 3fr 3fr 7fr 2fr 1fr;
			gap: 8px;

			button {
				width: 100%;
			}

			.ant-form-item {
				margin-bottom: 0;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProtocolMessageComponent {
	readonly channels = CHANNELS;
	readonly labelFn = (unit: Unit): string => unit.callSign;
	readonly messageSubmit = output<{
		sender: Unit | string;
		recipient: Unit | string;
		channel: string;
		message: string;
	}>();

	readonly unitService = inject(PossibleUnitSelectionsService);
	readonly units = signal<Unit[]>([]);
	readonly recipientInput =
		viewChild<AutocompleteComponent<Unit>>('recipientInput');
	readonly msgInput = viewChild<ElementRef>('msgInput');
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
		channel: this.fb.control<string>(DEFAULT_CHANNEL, Validators.required),
	});

	constructor() {
		this.messageForm.controls.sender.valueChanges
			.pipe(ensureSingleUnitSelectionPipe(this.unitService))
			.subscribe(() => setTimeout(() => this.recipientInput()?.focus()));

		this.messageForm.controls.recipient.valueChanges
			.pipe(ensureSingleUnitSelectionPipe(this.unitService))
			.subscribe(() =>
				setTimeout(() => this.msgInput()?.nativeElement.focus()),
			);
	}

	addProtocolMessage(): void {
		if (this.messageForm.invalid) {
			return;
		}
		const formValue = this.messageForm.getRawValue();

		// checking presence of sender and recipient is necessary for type inference
		if (this.messageForm.invalid || !formValue.sender || !formValue.recipient) {
			return;
		}

		this.messageSubmit.emit({
			sender: formValue.sender,
			recipient: formValue.recipient,
			channel: formValue.channel,
			message: formValue.message,
		});

		const defaultChannel =
			this.channels.find((channel) => channel.default)?.value ?? '';

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

		this.msgInput()?.nativeElement.blur();

		this.unitService.resetSelections();
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
