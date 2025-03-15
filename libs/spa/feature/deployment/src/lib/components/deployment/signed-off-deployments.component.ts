import {
	Component,
	computed,
	inject,
	input,
	viewChildren,
} from '@angular/core';
import { NzCardComponent } from 'ng-zorro-antd/card';

import { RescueStationDeployment } from '@kordis/shared/model';

import { DeploymentsSearchStateService } from '../../services/deployments-search-state.service';
import { NameSearchWrapperComponent } from './name-search-wrapper.component';

@Component({
	selector: 'krd-signed-off-deployments',
	template: `
		@if (showNoSearchResults()) {
			<div class="empty-state">
				<p>Keine abgemeldeten Rettungswachen gefunden</p>
			</div>
		}

		<!-- this can not be in an else block as search wrapper need to stay initialized! -->
		@for (station of rescueStations(); track station.id) {
			<krd-name-search-wrapper [name]="station.name">
				<nz-card>{{ station.name }}</nz-card>
			</krd-name-search-wrapper>
		} @empty {
			@if (!showNoSearchResults()) {
				<div class="empty-state">
					<p>Keine abgemeldeten Rettungswachen</p>
				</div>
			}
		}
	`,
	styles: `
		:host {
			display: flex;
			flex-direction: column;
			flex-wrap: wrap;
			gap: var(--base-spacing);
			height: 100%;

			.empty-state {
				margin: auto;
				width: 250px;
			}

			nz-card {
				width: var(--deployment-card-width, 230px);
			}
		}
	`,
	imports: [NameSearchWrapperComponent, NzCardComponent],
})
export class SignedOffDeploymentsComponent {
	readonly rescueStations = input.required<RescueStationDeployment[]>();

	private readonly searchWrappers = viewChildren(NameSearchWrapperComponent);
	private readonly searchStateService = inject(DeploymentsSearchStateService);
	readonly showNoSearchResults = computed(
		() =>
			!this.searchWrappers().some((wrapper) => wrapper.isVisible()) &&
			this.searchStateService.searchValue(),
	);
}
