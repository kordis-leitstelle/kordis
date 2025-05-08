import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { GlobalSearchComponent } from '@kordis/spa/core/misc';

@Component({
	selector: 'krd-action-bar',
	imports: [
		CommonModule,
		GlobalSearchComponent,
		NzButtonComponent,
		NzIconModule,
		RouterLink,
	],
	template: `
		<div class="actions-container">
			<a nz-button routerLink="/action-map" target="_blank">Karte</a>
		</div>
		<div class="search-container">
			<krd-global-search />
		</div>
	`,
	styles: `
		:host {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			width: 100%;
			gap: var(--base-spacing);
		}

		.actions-container {
			display: flex;
			flex-direction: row;
		}

		.search-container {
			flex: 0 0 200px;
			transition: flex 0.3s ease-in-out;
			overflow: hidden;

			&:focus-within {
				flex-grow: 1;
			}
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionBarComponent {}
