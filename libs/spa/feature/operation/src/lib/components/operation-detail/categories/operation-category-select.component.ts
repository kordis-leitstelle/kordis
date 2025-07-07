import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';

import { ControlValueAccessorBase } from '@kordis/spa/core/misc';

const TYPES = Object.freeze([
	'Einsatzabbruch / Fehleinsatz',
	'Eisunfall',
	'Erste-Hilfe-Leistung',
	'Ertrinkungsunfall',
	'Führungsdienst',
	'KatS-Einsatz',
	'Lebensrettung',
	'Personensuche',
	'Sachbergung',
	'Sanitätsdienst',
	'SEG-Einsatz',
	'Sonar-Einsatz',
	'sonstiger Einsatz',
	'Taucheinsatz',
	'Technische Hilfeleistung',
	'UAV-Einsatz',
	'wasserseitige Absicherung',
]);

@Component({
	selector: 'krd-operation-category-select',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => OperationCategorySelectComponent),
			multi: true,
		},
	],
	imports: [
		FormsModule,
		NzNoAnimationDirective,
		NzOptionComponent,
		NzSelectComponent,
	],
	template: `
		<nz-select
			nzShowSearch
			nzNoAnimation
			nzSize="small"
			[nzDisabled]="isDisabled()"
			[(ngModel)]="value"
			(nzBlur)="onTouch()"
			(ngModelChange)="onChange($event)"
		>
			@for (keyword of types; track $index) {
				<nz-option nzLabel="{{ keyword }}" nzValue="{{ keyword }}" />
			}
		</nz-select>
	`,
	styles: `
		nz-select {
			width: 100%;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationCategorySelectComponent extends ControlValueAccessorBase {
	readonly types = TYPES;
}
