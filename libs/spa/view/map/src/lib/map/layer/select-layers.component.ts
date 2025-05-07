import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxComponent } from 'ng-zorro-antd/checkbox';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';

import { MapLayersService } from './map-layers.service';

@Component({
	selector: `krd-select-map-layers`,
	template: `
		<nz-radio-group
			nzButtonStyle="solid"
			[(ngModel)]="layerService.activeStyle"
		>
			<label nz-radio-button nzValue="street">Straße</label>
			<label nz-radio-button nzValue="satellite">Satellit</label>
			<label nz-radio-button nzValue="dark">Dunkel</label>
		</nz-radio-group>
		<nz-divider />
		<div class="layers">
			@for (layer of layerService.layers(); track $index) {
				<label
					nz-checkbox
					[nzChecked]="layer.active()"
					(nzCheckedChange)="layerService.toggleLayer(layer.name)"
				>
					{{ layer.name }}
				</label>
			}
		</div>
	`,
	styles: `
		.layers {
			display: flex;
			flex-direction: column;

			.ant-checkbox-wrapper {
				margin-left: 0;
			}
		}

		.ant-divider-horizontal {
			margin: var(--base-spacing);
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		NzCheckboxComponent,
		NzDividerComponent,
		NzRadioComponent,
		NzRadioGroupComponent,
		FormsModule,
	],
})
export class SelectLayersComponent {
	readonly layerService = inject(MapLayersService);
}
