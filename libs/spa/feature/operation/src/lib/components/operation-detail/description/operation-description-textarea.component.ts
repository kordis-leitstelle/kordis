import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	forwardRef,
	viewChild,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzInputDirective } from 'ng-zorro-antd/input';

import { ControlValueAccessorBase } from '@kordis/spa/core/misc';

@Component({
	selector: 'krd-operation-description-textarea',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => OperationDescriptionTextareaComponent),
			multi: true,
		},
	],
	imports: [CommonModule, FormsModule, NzInputDirective],
	template: `
		<textarea
			#textarea
			nz-input
			[(ngModel)]="value"
			(ngModelChange)="onChange($event)"
			[disabled]="isDisabled()"
			(blur)="onTouch()"
		></textarea>
	`,
	styles: `
		textarea.ant-input {
			resize: none;
			height: 100%;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationDescriptionTextareaComponent extends ControlValueAccessorBase {
	protected readonly textArea = viewChild<ElementRef>('textarea');

	focus(): void {
		this.textArea()?.nativeElement.focus();
	}
}
