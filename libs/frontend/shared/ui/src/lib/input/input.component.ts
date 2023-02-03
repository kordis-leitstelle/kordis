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
/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

@Component({
	selector: 'krd-input',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './input.component.html',
	styles: [
		`
			.input-error {
				@apply border-red-300 text-red-900 placeholder-red-300 focus:border-danger focus:ring-danger;
			}
			:host-context(.dark) .input-error {
				@apply border-red-400  text-danger placeholder-red-400;
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

	private onTouched: () => void = () => {};
	private onChanged: (_: string) => void = (_) => {};
}
