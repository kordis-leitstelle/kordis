import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { GlobalSearchStateService } from './global-search-state.service';

@Component({
	selector: 'krd-global-search',
	template: `
		<nz-input-group [nzSuffix]="suffixTemplate">
			<input
				[(ngModel)]="searchStateService.searchValue"
				nz-input
				nz-tooltip="Einheiten, Alarmgruppen, Rettungswachen und Einsätze durchsuchen"
				placeholder="Suche"
			/>
		</nz-input-group>
		<ng-template #suffixTemplate>
			<i
				(click)="searchStateService.searchValue.set('')"
				class="reset-icon"
				nz-icon
				nzType="close"
			></i>
		</ng-template>
	`,
	imports: [
		NzInputDirective,
		NzInputGroupComponent,
		NzTooltipDirective,
		NzIconDirective,
		FormsModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchComponent {
	readonly searchStateService = inject(GlobalSearchStateService);
}
