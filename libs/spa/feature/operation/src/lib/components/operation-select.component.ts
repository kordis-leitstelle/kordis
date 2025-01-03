import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	effect,
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
		NzSelectComponent,
		NzOptionComponent,
		FormsModule,
		NzNoAnimationDirective,
	],
	template: `
		<nz-select
			nzPlaceHolder="Einsatz auswählen"
			[(ngModel)]="selectedOperation"
			(ngModelChange)="operationSelected.emit($event)"
			nzNotFoundContent="Keine aktiven Einsätze"
			nzNoAnimation
			[nzDropdownMatchSelectWidth]="false"
			[nzOptionHeightPx]="55"
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
	/*
	 * Select the first operation in the list if true, if the operations change, select the first operation if the selected operation is not in the list. If no operations are available, set null.
	 */
	readonly selectFirstOperation = input<boolean>(true);

	constructor() {
		effect(
			() => {
				if (this.selectFirstOperation()) {
					if (
						this.operations().length &&
						// if no operation is selected or the selected operation is not in the list of operations, select the first operation
						(!this.selectedOperation() ||
							!this.operations().some(
								(o) => o.id === this.selectedOperation()?.id,
							))
					) {
						this.selectedOperation.set(this.operations()[0]);
					} else if (!this.operations().length) {
						this.selectedOperation.set(null);
					}
				}
			},
			{ allowSignalWrites: true },
		);
	}

	test(event: any) {
		console.log(event);
	}
}
