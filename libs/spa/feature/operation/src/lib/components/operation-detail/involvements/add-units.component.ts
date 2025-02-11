import { Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { PlusOutline } from '@ant-design/icons-angular/icons';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';

import { Unit } from '@kordis/shared/model';
import { UnitsSelectionComponent } from '@kordis/spa/core/ui';

@Component({
	selector: 'krd-add-units',
	template: `<krd-units-select [control]="newUnitsGroup" /><button
			(click)="emitUnits()"
			nz-button
			nzSize="small"
			nzType="primary"
		>
			<span nz-icon nzTheme="outline" nzType="plus"></span>Hinzufügen
		</button>`,
	styles: `
		:host {
			display: flex;
			flex-direction: column;
			width: 200px;
			gap: 5px;
		}
	`,
	imports: [UnitsSelectionComponent, NzButtonComponent, NzIconDirective],
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
