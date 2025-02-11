import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	input,
	model,
	output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';

import { Operation } from '@kordis/shared/model';

@Component({
	selector: 'krd-operation-select',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		NzNoAnimationDirective,
		NzOptionComponent,
		NzSelectComponent,
	],
	template: `
		<nz-select
			nzPlaceHolder="Einsatz auswählen"
			[(ngModel)]="selectedOperation"
			(ngModelChange)="operationSelected.emit($event)"
			nzNotFoundContent="Keine Einsätze vorhanden"
			nzNoAnimation
			[nzDropdownMatchSelectWidth]="false"
			[nzOptionHeightPx]="55"
			[compareWith]="areOperationIdsEqual"
		>
			@for (operation of operations(); track operation.id) {
				<nz-option
					nzCustomContent
					[nzLabel]="operation.sign"
					[nzValue]="operation"
				>
					<div>
						<span class="operation-sign">{{ operation.sign }}</span> -
						{{ operation.alarmKeyword }}
					</div>
					<small>
						@if (
							operation.location.address.name &&
							operation.location.address.street
						) {
							{{ operation.location.address.name }} -
							{{ operation.location.address.street }}
						} @else if (operation.location.address.street) {
							{{ operation.location.address.street }}
						} @else {
							{{ operation.location.address.name }}
						}
					</small>
				</nz-option>
			}
		</nz-select>
	`,
	styles: `
		nz-select {
			width: 100%;
		}

		nz-option {
			display: flex;
			flex-direction: column;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationSelectComponent {
	selectedOperation = model<Operation | null>(null);
	/*
	 * This emits if the *User* selects an operation from the list and NOT if the selected operation changes programmatically.
	 */
	readonly operationSelected = output<Operation>();
	readonly operations = input.required<Operation[]>();

	protected areOperationIdsEqual(o1: Operation, o2: Operation | null): boolean {
		return o1.id === o2?.id;
	}
}
