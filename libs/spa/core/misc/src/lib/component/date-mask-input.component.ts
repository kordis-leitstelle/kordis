import { DatePipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	forwardRef,
	input,
	signal,
} from '@angular/core';
import {
	ControlValueAccessor,
	FormsModule,
	NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { NzInputDirective } from 'ng-zorro-antd/input';

@Component({
	standalone: true,
	selector: 'krd-date-mask-input',
	template: `
		<input
			nz-input
			style="width: 100%"
			[nzSize]="size()"
			[type]="maskType()"
			step="1"
			[ngModel]="value() | date: dateMask()"
			(ngModelChange)="setDateValue($event)"
			[disabled]="isDisabled()"
		/>
	`,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => DateMaskInputComponent),
			multi: true,
		},
	],
	imports: [DatePipe, FormsModule, NzInputDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateMaskInputComponent implements ControlValueAccessor {
	readonly size = input<NzSizeLDSType>('default');
	readonly maskType = input<'datetime-local' | 'date'>('datetime-local');

	protected readonly dateMask = computed(() =>
		this.maskType() === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-ddTHH:mm:ss',
	);
	protected readonly value = signal<Date | null>(null);
	protected readonly isDisabled = signal<boolean>(false);

	/* eslint-disable @typescript-eslint/no-empty-function */
	onTouch: () => void = () => {};
	onChange: (value: Date) => void = () => {};

	/* eslint-enable @typescript-eslint/no-empty-function */

	writeValue(value: Date): void {
		this.value.set(value);
	}

	registerOnChange(fn: (value: Date) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouch = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled.set(isDisabled);
	}

	protected setDateValue(value: string): void {
		const date = new Date(value);
		this.writeValue(date);
		this.onChange(date);
	}
}
