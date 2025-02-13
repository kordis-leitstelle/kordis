import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	forwardRef,
	inject,
	output,
	viewChild,
} from '@angular/core';
import {
	FormsModule,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule,
} from '@angular/forms';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { ControlValueAccessorBase } from 'spa/core/misc';

const KEYWORDS = Object.freeze([
	'THWAY',
	'THWAK',
	'THWAM',
	'THWAMOEL',
	'FEUWALD',
	'FEUxY',
	'NIL',
	'KatS Warndienst',
	'KatS Alarm',
]);

@Component({
	selector: 'krd-alarm-keyword-select',
	imports: [
		FormsModule,
		NzSelectComponent,
		NzOptionComponent,
		NzNoAnimationDirective,
		ReactiveFormsModule,
	],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => OperationAlarmKeywordSelectComponent),
			multi: true,
		},
	],
	template: `
		<nz-select
			nzShowSearch
			nzNoAnimation
			(nzFocus)="selectElement()?.setOpenState(true)"
			[disabled]="isDisabled()"
			[(ngModel)]="value"
			(blur)="onTouch()"
			(ngModelChange)="onModelChange($event)"
		>
			@for (keyword of keywords; track keyword) {
				<nz-option nzLabel="{{ keyword }}" nzValue="{{ keyword }}" />
			}
		</nz-select>
	`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationAlarmKeywordSelectComponent extends ControlValueAccessorBase {
	readonly keywordSelected = output<void>();
	readonly selectElement = viewChild(NzSelectComponent);

	protected readonly keywords = KEYWORDS;

	private readonly destroyRef = inject(DestroyRef);

	focus(): void {
		this.selectElement()?.focus();
	}

	protected onModelChange(value: string): void {
		this.onChange(value);
		this.keywordSelected.emit();
	}
}
