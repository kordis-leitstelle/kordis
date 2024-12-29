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
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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

	private readonly searchResults: Signal<DeploymentAssignment[]> = toSignal(
		this.searchStateService.searchValueChange$.pipe(
			map((searchTerm) => {
				searchTerm = searchTerm.toLowerCase();
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
			}),
		),
		{
			initialValue: [],
		},
	);

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
			this.searchResults().length,
	);

	readonly filteredAssignments = computed(() =>
		this.searchStateService.searchValue() && !this.hasNameMatch()
			? this.searchResults()
			: this.assignments(),
	);
}
