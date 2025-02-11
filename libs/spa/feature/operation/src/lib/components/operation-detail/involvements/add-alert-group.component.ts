import { Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { PlusOutline } from '@ant-design/icons-angular/icons';
import { NzIconService } from 'ng-zorro-antd/icon';

import { Unit } from '@kordis/shared/model';

@Component({
	selector: 'krd-add-units',
	template: ``,
	styles: `
		:host {
			display: flex;
			flex-direction: column;
			width: 200px;
			gap: 5px;
		}
	`,
	imports: [],
})
export class AddUnitsComponent {
	readonly unitsSelected = output<Unit[]>();
	protected readonly newUnitsGroup = inject(NonNullableFormBuilder).control<
		Unit[]
	>([]);

	constructor(iconService: NzIconService) {
		iconService.addIcon(PlusOutline);
	}

	reset(): void {
		this.newUnitsGroup.reset();
	}

	protected emitUnits(): void {
		this.unitsSelected.emit(this.newUnitsGroup.value);
		this.reset();
	}
}
