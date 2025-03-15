import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';

import { GlobalSearchStateService } from './global-search-state.service';

@Component({
	selector: 'krd-global-search',
	template: `
		<nz-input-group [nzSuffix]="suffixTemplate" [nzPrefix]="prefixTemplate">
			<input
				[(ngModel)]="searchStateService.searchValue"
				nz-input
				placeholder="Einheiten, Alarmgruppen, Rettungswachen und Einsätze durchsuchen"
			/>
		</nz-input-group>
		<ng-template #prefixTemplate
			><nz-icon nzType="search" nzTheme="outline"
		/></ng-template>
		<ng-template #suffixTemplate>
			@if (searchStateService.searchValue()) {
				<span
					nz-icon
					nzTheme="fill"
					class="ant-input-clear-icon"
					nzType="close-circle"
					(click)="searchStateService.searchValue.set('')"
				></span>
			}
		</ng-template>
	`,
	styles: `
		:host {
			width: 100%;
		}
	`,
	imports: [
		NzInputDirective,
		NzInputGroupComponent,
		NzIconDirective,
		FormsModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchComponent {
	readonly searchStateService = inject(GlobalSearchStateService);
}
