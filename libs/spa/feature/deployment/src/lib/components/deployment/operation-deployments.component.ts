import {
	Component,
	computed,
	inject,
	input,
	viewChildren,
} from '@angular/core';

import { OperationDeployment } from '@kordis/shared/model';
import { GlobalSearchStateService } from '@kordis/spa/core/misc';

import { DeploymentSearchWrapperComponent } from './deployment-search-wrapper.component';
import { DeploymentCardComponent } from './deplyoment-card.component';

@Component({
	selector: 'krd-operation-deployments',
	template: `
		@if (showNoSearchResults()) {
			<div class="empty-state">
				<p>Keine laufenden Einsätze</p>
			</div>
		}

		<!-- this can not be in an else block as search wrapper need to stay initialized! -->
		@for (deployment of operations(); track deployment.id) {
			<krd-deployment-search-wrapper
				[name]="
					deployment.operation.alarmKeyword +
					' ' +
					deployment.operation.sign +
					' ' +
					deployment.operation.location.address.name +
					' ' +
					deployment.operation.location.address.street
				"
				[assignments]="deployment.assignments"
			>
				<ng-template let-assignments>
					<div class="deployment-card">
						<krd-deployment-card
							[clickable]="false"
							[name]="
								deployment.operation.alarmKeyword +
								' ' +
								deployment.operation.sign
							"
							[assignments]="assignments"
						>
							<small>
								{{
									deployment.operation.location.address.name +
										' ' +
										deployment.operation.location.address.street
								}}
							</small>
						</krd-deployment-card>
					</div>
				</ng-template>
			</krd-deployment-search-wrapper>
		} @empty {
			@if (!showNoSearchResults()) {
				<div class="empty-state">
					<p>Keine laufenden Einsätze</p>
				</div>
			}
		}
	`,
	styles: `
		:host {
			display: flex;
			flex-direction: row;
			gap: var(--base-spacing);
			height: 100%;
		}

		.deployment-card {
			width: var(--deployment-card-width, 230px);
			height: 100%;
		}

		.empty-state {
			align-self: center;
			width: 250px;
		}
	`,
	imports: [DeploymentCardComponent, DeploymentSearchWrapperComponent],
})
export class OperationDeploymentsComponent {
	readonly operations = input.required<OperationDeployment[]>();

	private readonly searchWrappers = viewChildren(
		DeploymentSearchWrapperComponent,
	);
	private readonly searchStateService = inject(GlobalSearchStateService);
	readonly showNoSearchResults = computed(
		() =>
			// if no cards are visible and search value is not empty, this is a bit weird but right now the best I have got
			// the alternative would be to filter everything from the parent, which, imo, would result in a total mess
			!this.searchWrappers().some((wrapper) => wrapper.isVisible()) &&
			this.searchStateService.searchValue(),
	);
}
