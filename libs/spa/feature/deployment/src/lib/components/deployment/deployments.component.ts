import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
	CloseOutline,
	EditOutline,
	InfoCircleOutline,
	UndoOutline,
} from '@ant-design/icons-angular/icons';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { merge, switchMap } from 'rxjs';

import { Query } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { DeploymentsSearchStateService } from '../../services/deployments-search-state.service';
import { AlertGroupEditModalComponent } from '../alert-group-edit-modal/alert-group-edit-modal.component';
import { DeploymentSearchWrapperComponent } from './deployment-search-wrapper.component';
import { DeploymentCardComponent } from './deplyoment-card.component';
import { RESCUE_STATION_FRAGMENT } from './rescue-station/rescue-station.fragment';
import { SignedInRescueStationsComponent } from './signed-in-rescue-stations.component';
import { SignedOffDeploymentsComponent } from './signed-off-deployments.component';

const DEPLOYMENTS_QUERY = gql`
	${RESCUE_STATION_FRAGMENT}
	query {
		signedInStations: rescueStationDeployments(signedIn: true) {
			...RescueStationData
		}
		signedOffStations: rescueStationDeployments(signedIn: false) {
			...RescueStationData
		}
		unassignedEntities {
			... on DeploymentUnit {
				unit {
					...UnitData
				}
			}
			... on DeploymentAlertGroup {
				alertGroup {
					id
					name
				}
				assignedUnits {
					unit {
						...UnitData
					}
				}
			}
		}
	}
`;

@Component({
	selector: 'krd-deployments',
	standalone: true,
	imports: [
		DeploymentCardComponent,
		DeploymentSearchWrapperComponent,
		FormsModule,
		NzButtonComponent,
		NzDividerComponent,
		NzIconDirective,
		NzInputDirective,
		NzInputGroupComponent,
		NzPopconfirmDirective,
		SignedInRescueStationsComponent,
		SignedOffDeploymentsComponent,
	],
	providers: [DeploymentsSearchStateService],
	templateUrl: './deployments.component.html',
	styleUrl: './deployments.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentsComponent {
	readonly searchStateService = inject(DeploymentsSearchStateService);

	private readonly gqlService = inject(GraphqlService);
	private readonly deploymentsQuery = this.gqlService.query<{
		signedInStations: Query['rescueStationDeployments'];
		signedOffStations: Query['rescueStationDeployments'];
		unassignedEntities: Query['unassignedEntities'];
	}>(DEPLOYMENTS_QUERY);

	readonly deployments = toSignal(
		this.deploymentsQuery.$.pipe(takeUntilDestroyed()),
		{
			initialValue: {
				signedInStations: [],
				signedOffStations: [],
				unassignedEntities: [],
			},
		},
	);

	private readonly modalService = inject(NzModalService);
	private readonly notificationService = inject(NzNotificationService);

	constructor(iconService: NzIconService) {
		iconService.addIcon(
			InfoCircleOutline,
			UndoOutline,
			EditOutline,
			CloseOutline,
		);

		// right now we greedily get all deployments, as a change in a deployment or a unit can result in changes in multiple deployment
		// a better way would be to have more fine events for all actions taken that could replay the action in the frontend
		merge(
			this.gqlService.subscribe$(gql`
				subscription {
					signedInRescueStationUpdated {
						id
					}
				}
			`),
			this.gqlService.subscribe$(gql`
				subscription {
					rescueStationSignedOff {
						id
					}
				}
			`),
			this.gqlService.subscribe$(gql`
				subscription {
					rescueStationSignedIn {
						id
					}
				}
			`),
		)
			.pipe(takeUntilDestroyed())
			.subscribe(() => this.deploymentsQuery.refresh());

		// subscribe to note updates, will update the cache
		this.gqlService
			.subscribe$(gql`
				subscription {
					rescueStationNoteUpdated {
						id
						note
					}
				}
			`)
			.pipe(takeUntilDestroyed())
			.subscribe();
	}

	openAlertGroupsEditModal(): void {
		this.modalService.create({
			nzContent: AlertGroupEditModalComponent,
			nzFooter: null,
			nzClosable: true,
			nzNoAnimation: true,
		});
	}

	resetDeployments(): void {
		this.gqlService
			.mutate$(gql`
				mutation {
					resetRescueStations {
						id
						signedIn
					}
					resetCurrentAlertGroupUnits {
						id
						currentUnits {
							id
						}
					}
					resetUnitNotes {
						id
						note
					}
				}
			`)
			.pipe(switchMap(() => this.deploymentsQuery.refresh()))
			.subscribe(() =>
				this.notificationService.success(
					'Zurückgesetzt',
					'Zurücksetzen der Einheiten, Alarmgruppen und Rettungswachen erfolgreich',
				),
			);
	}
}
