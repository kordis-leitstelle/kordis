import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InfoCircleOutline } from '@ant-design/icons-angular/icons';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { Observable, map, merge, shareReplay } from 'rxjs';

import {
	DeploymentAssignment,
	Query,
	RescueStationDeployment,
} from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { RescueStationEditModalComponent } from '../rescue-station-edit-modal/rescue-station-edit-modal.component';
import { DeploymentCardComponent } from './deplyoment-card.component';

const DEPLOYMENTS_QUERY = gql`
	fragment UnitData on Unit {
		id
		callSign
		name
		note
		status {
			status
			receivedAt
		}
	}
	fragment RescueStationData on RescueStationDeployment {
		id
		name
		note
		signedIn
		defaultUnits {
			...UnitData
		}
		strength {
			helpers
			subLeaders
			leaders
		}
		assignments {
			... on DeploymentUnit {
				unit {
					...UnitData
				}
			}
			... on DeploymentAlertGroup {
				assignedUnits {
					unit {
						...UnitData
					}
				}
				alertGroup {
					id
					name
				}
			}
		}
	}
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
		AsyncPipe,
		DeploymentCardComponent,
		NzCardComponent,
		NzDividerComponent,
		NzIconDirective,
		NzTooltipDirective,
	],
	templateUrl: `./deployments.component.html`,
	styleUrl: `./deployments.component.css`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentsComponent {
	readonly signedInRescueStations$: Observable<RescueStationDeployment[]>;
	readonly signedOffRescueStations$: Observable<RescueStationDeployment[]>;
	readonly unassigned$: Observable<DeploymentAssignment[]>;
	private readonly gqlService = inject(GraphqlService);
	private readonly modalService = inject(NzModalService);

	constructor(iconService: NzIconService) {
		iconService.addIcon(InfoCircleOutline);

		const deploymentsQuery = this.gqlService.query<{
			signedInStations: Query['rescueStationDeployments'];
			signedOffStations: Query['rescueStationDeployments'];
			unassignedEntities: Query['unassignedEntities'];
		}>(DEPLOYMENTS_QUERY);

		const deployments$ = deploymentsQuery.$.pipe(
			takeUntilDestroyed(),
			shareReplay({ bufferSize: 1, refCount: true }),
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
			.subscribe(() => deploymentsQuery.refresh());

		this.signedInRescueStations$ = deployments$.pipe(
			map(({ signedInStations }) => signedInStations),
		);
		this.signedOffRescueStations$ = deployments$.pipe(
			map(({ signedOffStations }) => signedOffStations),
		);
		this.unassigned$ = deployments$.pipe(
			map(({ unassignedEntities }) => unassignedEntities),
		);
	}

	openRescueStationEditModal(station: RescueStationDeployment): void {
		this.modalService.create({
			nzContent: RescueStationEditModalComponent,
			nzData: station,
			nzFooter: null,
			nzClosable: false,
			nzNoAnimation: true,
		});
	}
}
