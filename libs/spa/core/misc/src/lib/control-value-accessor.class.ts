import { signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export class ControlValueAccessorBase implements ControlValueAccessor {
	protected value = signal<string>('');
	protected readonly isDisabled = signal<boolean>(false);

	/* eslint-disable @typescript-eslint/no-empty-function */
	onTouch: () => void = () => {};
	onChange: (value: string) => void = () => {};

	/* eslint-enable @typescript-eslint/no-empty-function */

	writeValue(value: string): void {
		this.value.set(value);
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouch = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled.set(isDisabled);
	}
}
