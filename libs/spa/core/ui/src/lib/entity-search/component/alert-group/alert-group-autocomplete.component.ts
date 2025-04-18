import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { AlertGroup } from '@kordis/shared/model';

import { PossibleAlertGroupSelectionsService } from '../../service/alert-group-selection.service';
import { AutocompleteComponent } from '../search.component';

@Component({
	selector: 'krd-alert-group-autocomplete',
	imports: [
		NzAutocompleteModule,
		NzSelectModule,
		ReactiveFormsModule,
		NzInputDirective,
		NzNoAnimationDirective,
		AsyncPipe,
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
			@for (alertGroup of result$ | async; track alertGroup.id) {
				<nz-auto-option [nzValue]="alertGroup">
					<div class="result-item">
						<span class="name">{{ alertGroup.name }}</span>
						@if (
							alertGroup.assignment?.__typename ===
							'EntityRescueStationAssignment'
						) {
							<small>Zuordnung: {{ $any(alertGroup.assignment).name }}</small>
						} @else if (
							alertGroup.assignment?.__typename === 'EntityOperationAssignment'
						) {
							<small
								>Zuordnung:
								{{ $any(alertGroup.assignment).operation.alarmKeyword }}
								{{ $any(alertGroup.assignment).operation.sign }}</small
							>
						}
					</div>
				</nz-auto-option>
			}
		</nz-autocomplete>
	`,
	styles: `
		.result-item {
			display: flex;
			flex-direction: column;

			.name {
				font-weight: 500;
			}
		}
	`,
})
export class AlertGroupAutocompleteComponent extends AutocompleteComponent<AlertGroup> {
	constructor(
		possibleAlertGroupSelectionsService: PossibleAlertGroupSelectionsService,
	) {
		super(possibleAlertGroupSelectionsService);
	}
}
