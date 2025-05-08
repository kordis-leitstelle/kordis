import { NgTemplateOutlet } from '@angular/common';
import {
	Component,
	Signal,
	TemplateRef,
	booleanAttribute,
	computed,
	contentChild,
	effect,
	inject,
	input,
} from '@angular/core';

import { DeploymentAssignment } from '@kordis/shared/model';
import { GlobalSearchStateService } from '@kordis/spa/core/misc';
import {
	EntitySearchEngine,
	unitOrAlertGroupOfAssignmentMatches,
} from '@kordis/spa/core/ui';

@Component({
	selector: 'krd-deployment-search-wrapper',
	imports: [NgTemplateOutlet],
	template: `
		@if (isVisible()) {
			<ng-template
				*ngTemplateOutlet="
					templateRef()!;
					context: { $implicit: filteredAssignments() }
				"
			/>
		}
	`,
})
export class DeploymentSearchWrapperComponent {
	readonly assignments = input.required<DeploymentAssignment[]>();
	readonly name = input<string>('');
	readonly alwaysShow = input(false, {
		transform: booleanAttribute,
	});

	protected readonly templateRef = contentChild(TemplateRef);

	private readonly searchStateService = inject(GlobalSearchStateService);
	private readonly hasNameMatch = computed(() =>
		this.name()
			.toLowerCase()
			.includes(this.searchStateService.searchValue().toLowerCase()),
	);
	private readonly assignmentsSearchEngine = new EntitySearchEngine(
		unitOrAlertGroupOfAssignmentMatches,
	);
	readonly filteredAssignments: Signal<DeploymentAssignment[]> = computed(
		() => {
			// show if we have no search term or the name matches
			if (!this.searchStateService.searchValue() || this.hasNameMatch()) {
				return this.assignments();
			}
			return this.assignmentsSearchEngine.search(
				this.searchStateService.searchValue(),
			);
		},
	);
	readonly isVisible = computed(
		() =>
			this.alwaysShow() ||
			// no search
			!this.searchStateService.searchValue() ||
			// the user searches the rescue station
			this.hasNameMatch() ||
			// or the user searches the assignments
			this.filteredAssignments().length,
	);

	constructor() {
		effect(() =>
			this.assignmentsSearchEngine.setSearchableEntities(this.assignments()),
		);
	}
}
