import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { Unit } from '@kordis/shared/model';

import { PossibleUnitSelectionsService } from '../../service/unit-selection.service';
import { AutocompleteComponent } from '../search.component';

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
	template: `
		<input
			[formControl]="searchInput"
			nz-input
			(focus)="onSearchInputFocus()"
			[nzAutocomplete]="auto"
		/>
		<nz-autocomplete
			(selectionChange)="onSelect($event)"
			[nzBackfill]="false"
			[nzNoAnimation]="true"
			#auto
		>
			@for (unit of result$ | async; track unit.id) {
				<nz-auto-option [nzValue]="unit">
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
export class UnitAutocompleteComponent extends AutocompleteComponent<Unit> {
	constructor(possibleUnitSelectionsService: PossibleUnitSelectionsService) {
		super(possibleUnitSelectionsService);
	}
}
