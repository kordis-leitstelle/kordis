import { Component, computed, inject, input } from '@angular/core';

import { GlobalSearchStateService } from '@kordis/spa/core/misc';

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
	private readonly searchStateService = inject(GlobalSearchStateService);
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
