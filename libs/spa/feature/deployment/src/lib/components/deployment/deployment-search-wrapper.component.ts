import { NgTemplateOutlet } from '@angular/common';
import {
	Component,
	Signal,
	TemplateRef,
	booleanAttribute,
	computed,
	contentChild,
	inject,
	input,
} from '@angular/core';

import { DeploymentAssignment, Unit } from '@kordis/shared/model';

import { DeploymentsSearchStateService } from '../../services/deployments-search-state.service';

@Component({
	selector: 'krd-deployment-search-wrapper',
	standalone: true,
	imports: [NgTemplateOutlet],
	template: `
		@if (isVisible()) {
			<ng-template
				*ngTemplateOutlet="
					templateRef()!;
					context: { $implicit: computedAssignments() }
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
	readonly computedAssignments: Signal<DeploymentAssignment[]> = computed(
		() => {
			const searchTerm = this.searchStateService.searchValue().toLowerCase();
			// show if we have no search term or the name matches
			if (!searchTerm || this.hasNameMatch()) {
				return this.assignments();
			}
			// otherwise we have a search term, return filtered assignments

			return this.assignments().filter((assignment) => {
				const hasUnitMatch = (unit: Unit): boolean => {
					return (
						unit.name.toLowerCase().includes(searchTerm) ||
						unit.callSign.toLowerCase().includes(searchTerm) ||
						unit.callSignAbbreviation.toLowerCase().includes(searchTerm)
					);
				};

				switch (assignment.__typename) {
					case 'DeploymentUnit':
						return hasUnitMatch(assignment.unit);
					case 'DeploymentAlertGroup':
						return (
							assignment.alertGroup.name.toLowerCase().includes(searchTerm) ||
							assignment.assignedUnits.some(({ unit }) => hasUnitMatch(unit))
						);
					default:
						return false;
				}
			});
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
			this.computedAssignments().length,
	);
}
