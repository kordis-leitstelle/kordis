import { AsyncPipe } from '@angular/common';
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
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { filter, pairwise, pipe, startWith, tap } from 'rxjs';

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
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProtocolMessageComponent {
	readonly channels = CHANNELS;
	readonly labelFn = (unit: Unit): string => unit.callSign;

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
		channel: this.fb.control<string>(
			this.channels.find((channel) => channel.default)?.value ?? '',
			Validators.required,
		),
	});

	private readonly client = inject(ProtocolClient);

	constructor() {
		// do not allow same unit as sender and recipient
		const ensureSingleUnitSelectionPipe = pipe(
			startWith(undefined),
			pairwise(),
			filter(([prev, curr]) => prev !== curr && !!curr),
			tap(([prev, curr]) => {
				if (curr && typeof curr !== 'string') {
					this.unitService.markAsSelected(curr as Unit);
					if (prev && typeof prev !== 'string') {
						this.unitService.unmarkAsSelected(prev as Unit);
					}
				}
			}),
		);

		this.messageForm.controls.sender.valueChanges
			.pipe(ensureSingleUnitSelectionPipe)
			.subscribe(() => setTimeout(() => this.recipientInput()?.focus()));

		this.messageForm.controls.recipient.valueChanges
			.pipe(ensureSingleUnitSelectionPipe)
			.subscribe(() =>
				setTimeout(() => this.msgInput()?.nativeElement.focus()),
			);
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
