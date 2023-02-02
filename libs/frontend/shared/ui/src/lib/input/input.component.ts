import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	forwardRef,
	Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	ControlValueAccessor,
	FormsModule,
	NG_VALUE_ACCESSOR,
} from '@angular/forms';

/* eslint @typescript-eslint/no-explicit-any: 0 */
@Component({
	selector: 'krd-input',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div>
			<label *ngIf="label">{{ label }}</label>
			<div class="relative mt-1 rounded-md shadow-sm">
				<input
					[type]="type"
					[placeholder]="placeholder"
					[disabled]="isDisabled"
					[(ngModel)]="value"
					[class.input-error]="hasError"
				/>
				<div
					*ngIf="hasError"
					class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
				>
					<svg
						class="h-5 w-5 text-red-500"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
			</div>
			<p
				*ngIf="errorText && hasError"
				class="mt-2 mr-3 float-right text-sm text-red-600"
			>
				{{ errorText }}
			</p>
		</div>
	`,
	styles: [
		`
			label {
				@apply block font-medium text-gray-700;
			}

			input {
				@apply block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm;
			}

			.input-error {
				@apply border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500;
			}
		`,
	],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => InputComponent),
			multi: true,
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
	@Input() isDisabled = false;
	@Input() label?: string;
	@Input() placeholder = '';
	@Input() type: 'text' | 'email' | 'password' = 'text';
	@Input() hasError = false;
	@Input() errorText?: string;
	private onTouched!: () => void;
	private onChanged!: (_: string) => void;

	constructor(private readonly cd: ChangeDetectorRef) {}

	private _value = '';

	get value(): string {
		return this._value;
	}

	set value(v) {
		this._value = v;
		this.onChanged(this._value);
		this.onTouched();
	}

	registerOnChange(fn: any): void {
		this.onChanged = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	writeValue(v: string): void {
		this._value = v;
		this.cd.detectChanges();
	}
	setDisabledState?(isDisabled: boolean): void {
		this.isDisabled = isDisabled;
	}
}
