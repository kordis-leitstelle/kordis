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
import { toSignal } from '@angular/core/rxjs-interop';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { of, switchMap } from 'rxjs';

import { DeploymentAssignment } from '@kordis/shared/model';

import { DeploymentsSearchStateService } from '../../services/deployments-search-state.service';
import { DeploymentAssignmentsSearchService } from '../../services/deplyoment-assignments-search.service';
import { DeploymentCardComponent } from './deplyoment-card.component';

@Component({
	selector: 'krd-deployment-search-wrapper',
	standalone: true,
	imports: [
		DeploymentCardComponent,
		NzIconDirective,
		NzTooltipDirective,
		NgTemplateOutlet,
	],
	providers: [DeploymentAssignmentsSearchService],
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
	private readonly searchService = inject(DeploymentAssignmentsSearchService);

	private readonly searchResults: Signal<DeploymentAssignment[]> = toSignal(
		this.searchStateService.searchValueChange$.pipe(
			switchMap((searchValue) =>
				searchValue ? this.searchService.search(searchValue) : of([]),
			),
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

	constructor() {
		effect(() => this.searchService.updateAssignments(this.assignments()));
	}
}
