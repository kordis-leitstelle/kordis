import { Component, computed, inject, input } from '@angular/core';

import { DeploymentsSearchStateService } from '../../services/deployments-search-state.service';

@Component({
	selector: 'krd-name-search-wrapper',
	template: `
		@if (isVisible()) {
			<ng-content />
		}
	`,
})
export class NameSearchWrapperComponent {
	readonly name = input.required<string>();
	private readonly searchStateService = inject(DeploymentsSearchStateService);
	readonly isVisible = computed(
		() =>
			// no search
			!this.searchStateService.searchValue() ||
			// the user searches the name
			this.name()
				.toLowerCase()
				.includes(this.searchStateService.searchValue().toLowerCase()),
	);
}
