import { AsyncPipe } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { Unit } from '@kordis/shared/model';

import { PossibleUnitSelectionsService } from '../../service/unit-selection.service';
import { AutocompleteDirective } from '../autocomplete.directive';

@Component({
	selector: 'krd-unit-autocomplete',
	imports: [
		AsyncPipe,
		NzAutocompleteModule,
		NzInputDirective,
		NzNoAnimationDirective,
		NzSelectModule,
		ReactiveFormsModule,
	],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => UnitAutocompleteComponent),
			multi: true,
		},
	],
	template: `
		<input
			#input
			(input)="search(input.value)"
			nz-input
			(focus)="onSearchInputFocus()"
			[nzAutocomplete]="auto"
			(blur)="onTouch()"
			[value]="searchInput$ | async"
			[disabled]="isDisabled()"
		/>
		<nz-autocomplete
			(selectionChange)="onSelect($event)"
			[nzBackfill]="false"
			[nzNoAnimation]="true"
			#auto
		>
			@for (unit of result$ | async; track unit.id) {
				<nz-auto-option [nzValue]="unit" [nzLabel]="unit.callSign">
					<span class="call-sign">{{ unit.callSign }}</span>
					<span class="name">{{ unit.name }}</span>
				</nz-auto-option>
			}
		</nz-autocomplete>
	`,
	styles: `
		.call-sign {
			font-weight: 500;
			margin-right: calc(var(--base-spacing) / 2);
		}

		.name {
			color: grey;
			font-size: 0.9em;
		}
	`,
})
export class UnitAutocompleteComponent extends AutocompleteDirective<Unit> {
	constructor(possibleUnitSelectionsService: PossibleUnitSelectionsService) {
		super(possibleUnitSelectionsService, (unit) => unit.callSign);
	}
}
