import {
	Component,
	computed,
	inject,
	input,
	signal,
	viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { Subject, debounceTime, delay, switchMap, tap } from 'rxjs';

import { RescueStationDeployment } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { DeploymentsSearchStateService } from '../../services/deployments-search-state.service';
import { DeploymentNotePopupComponent } from './deployment-note-popup.component';
import { DeploymentSearchWrapperComponent } from './deployment-search-wrapper.component';
import { DeploymentCardComponent } from './deplyoment-card.component';
import { RescueStationDeploymentCardHeaderComponent } from './rescue-station/rescue-station-deployment-card-header.component';

@Component({
	selector: 'krd-signed-in-deployments',
	template: `
		@if (showNoSearchResults()) {
			<div class="empty-state">
				<p>Keine angemeldeten Rettungswachen gefunden</p>
			</div>
		}

		<!-- this can not be in an else block as search wrapper need to stay initialized! -->
		@for (station of rescueStations(); track station.id) {
			<krd-deployment-search-wrapper
				[name]="station.name"
				[assignments]="station.assignments"
			>
				<ng-template let-assignments>
					<div class="deployment-card">
						<ng-template #notePopoverContent>
							<krd-note-popup
								[note]="station.note"
								(noteChange)="updateNote(station.id, $event)"
								[isLoading]="isNoteUpdating()"
							/>
						</ng-template>
						<krd-deployment-card
							(click)="$event.stopPropagation()"
							nz-popover
							[nzPopoverBackdrop]="true"
							[nzPopoverContent]="notePopoverContent"
							[nzPopoverTitle]="station.name"
							nzPopoverTrigger="click"
							[name]="station.name"
							[assignments]="assignments"
						>
							<krd-rescue-station-deployment-card-header
								role="sub-header"
								[rescueStation]="station"
							/>
						</krd-deployment-card>
					</div>
				</ng-template>
			</krd-deployment-search-wrapper>
		} @empty {
			@if (!showNoSearchResults()) {
				<div class="empty-state">
					<p>Keine angemeldeten Rettungswachen</p>
				</div>
			}
		}
	`,
	styles: `
		:host {
			display: flex;
			flex-direction: row;
			gap: calc(var(--base-spacing) / 2);
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
	imports: [
		DeploymentCardComponent,
		DeploymentNotePopupComponent,
		DeploymentSearchWrapperComponent,
		NzPopoverDirective,
		RescueStationDeploymentCardHeaderComponent,
	],
})
export class SignedInRescueStationsComponent {
	readonly rescueStations = input.required<RescueStationDeployment[]>();

	readonly isNoteUpdating = signal(false);

	private readonly searchWrappers = viewChildren(
		DeploymentSearchWrapperComponent,
	);
	private readonly searchStateService = inject(DeploymentsSearchStateService);
	readonly showNoSearchResults = computed(
		() =>
			// if no cards are visible and search value is not empty, this is a bit weird but right now the best I have got
			// the alternative would be to filter everything from the parent, which, imo, would result in a total mess
			!this.searchWrappers().some((wrapper) => wrapper.isVisible()) &&
			this.searchStateService.searchValue(),
	);
	private readonly noteUpdatedSubject$ = new Subject<{
		id: string;
		note: string;
	}>();
	private readonly gqlService = inject(GraphqlService);

	constructor() {
		this.noteUpdatedSubject$
			.pipe(
				debounceTime(300),
				tap(() => this.isNoteUpdating.set(true)),
				switchMap(({ note, id }) =>
					this.gqlService.mutate$(
						gql`
							mutation UpdateRescueStationNote($id: ID!, $note: String!) {
								updateRescueStationNote(id: $id, note: $note) {
									id
									note
								}
							}
						`,
						{
							id,
							note,
						},
					),
				),
				delay(300), // eye candy for loading spinner
				takeUntilDestroyed(),
			)
			.subscribe(() => this.isNoteUpdating.set(false));
	}

	updateNote(id: string, note: string): void {
		this.noteUpdatedSubject$.next({ id, note });
	}
}
