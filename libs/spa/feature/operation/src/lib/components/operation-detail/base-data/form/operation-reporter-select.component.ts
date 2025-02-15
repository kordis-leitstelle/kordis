import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';

import { ControlValueAccessorBase } from '@kordis/spa/core/misc';

const REPORTER_TYPES = Object.freeze([
	'Anforderung',
	'Ausguck',
	'DLRG-Funk',
	'Nautische-Zentrale',
	'Passant',
	'RLSt',
	'Selbstkommer',
	'Telefon',
	'UKW-Seefunk',
	'WSP/Pol',
]);

@Component({
	selector: 'krd-reporter-select',
	imports: [
		CommonModule,
		FormsModule,
		NzNoAnimationDirective,
		NzOptionComponent,
		NzSelectComponent,
	],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => OperationReporterSelectComponent),
			multi: true,
		},
	],
	template: `
		<nz-select
			nzShowSearch
			nzAllowClear
			nzNoAnimation
			[nzDisabled]="isDisabled()"
			[(ngModel)]="value"
			(nzBlur)="onTouch()"
			(ngModelChange)="onChange($event)"
		>
			@for (type of types; track $index) {
				<nz-option [nzLabel]="type" [nzValue]="type" />
			}
		</nz-select>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationReporterSelectComponent extends ControlValueAccessorBase {
	readonly types = REPORTER_TYPES;
}
