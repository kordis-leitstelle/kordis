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
import {
	EntitySearchEngine,
	unitOrAlertGroupOfAssignmentMatches,
} from '@kordis/spa/core/ui';

import { DeploymentsSearchStateService } from '../../services/deployments-search-state.service';

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

	private readonly searchStateService = inject(DeploymentsSearchStateService);
	private readonly hasNameMatch = computed(() =>
		this.name()
			.toLowerCase()
			.includes(this.searchStateService.searchValue().toLowerCase()),
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
	private readonly assignmentsSearchEngine = new EntitySearchEngine(
		unitOrAlertGroupOfAssignmentMatches,
	);
	readonly filteredAssignments: Signal<DeploymentAssignment[]> = computed(
		() => {
			const searchTerm = this.searchStateService.searchValue().toLowerCase();
			// show if we have no search term or the name matches
			if (!searchTerm || this.hasNameMatch()) {
				return this.assignments();
			}
			return this.assignmentsSearchEngine.search(searchTerm);
		},
	);

	constructor() {
		effect(() =>
			this.assignmentsSearchEngine.setSearchableEntities(this.assignments()),
		);
	}
}
