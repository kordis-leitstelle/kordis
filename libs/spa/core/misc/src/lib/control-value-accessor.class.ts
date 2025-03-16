import { signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export class ControlValueAccessorBase<T = string>
	implements ControlValueAccessor
{
	protected readonly value = signal<T | undefined>(undefined);
	protected readonly isDisabled = signal<boolean>(false);

	/* eslint-disable @typescript-eslint/no-empty-function */
	onTouch: () => void = () => {};
	onChange: (value: T) => void = () => {};

	writeValue(value: T): void {
		this.value.set(value);
	}

	registerOnChange(fn: (value: T) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouch = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled.set(isDisabled);
	}
}
