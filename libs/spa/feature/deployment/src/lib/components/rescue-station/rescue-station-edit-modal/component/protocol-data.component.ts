import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnInit,
	inject,
	input,
	viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzInputDirective } from 'ng-zorro-antd/input';

import { Unit } from '@kordis/shared/model';

// placeholder until we have the protocol frontend ready!
@Component({
	selector: 'krd-protocol-data',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, NzInputDirective],
	template: `
		<div [formGroup]="formGroup()">
			<input
				data-testid="sender-input"
				#senderInput
				nz-input
				placeholder="Von"
				formControlName="sender"
			/>
			<input nz-input placeholder="An" formControlName="recipient" />
			<input nz-input placeholder="Kanal" formControlName="channel" />
		</div>
	`,
	styles: `
		div {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: calc(var(--base-spacing) / 2);
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtocolDataComponent implements OnInit {
	readonly formGroup = input.required<
		FormGroup<{
			sender: FormControl<string | Unit>;
			recipient: FormControl<string | Unit>;
			channel: FormControl<string>;
		}>
	>();
	readonly focusInitially = input(false, {
		transform: (x: unknown) => x !== false,
	});

	private readonly senderInputEle =
		viewChild<ElementRef<HTMLInputElement>>('senderInput');
	private readonly cd = inject(ChangeDetectorRef);

	ngOnInit(): void {
		if (this.focusInitially()) {
			// https://github.com/NG-ZORRO/ng-zorro-antd/issues/7257, modal container always has focus :(
			setTimeout(() => {
				this.senderInputEle()?.nativeElement.focus();
				this.formGroup().controls.sender.markAsUntouched();
				this.cd.markForCheck();
			}, 0);
		}
	}
}
