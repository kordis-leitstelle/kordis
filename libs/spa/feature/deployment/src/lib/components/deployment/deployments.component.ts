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
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { switchMap } from 'rxjs';

import { Query } from '@kordis/shared/model';
import {
	GraphqlService,
	MultiSubscriptionService,
	gql,
} from '@kordis/spa/core/graphql';

import { DeploymentsSearchStateService } from '../../services/deployments-search-state.service';
import { AlertGroupEditModalComponent } from '../alert-group-edit-modal/alert-group-edit-modal.component';
import { DeploymentSearchWrapperComponent } from './deployment-search-wrapper.component';
import { DEPLOYMENTS_QUERY } from './deployments.query';
import { DeploymentCardComponent } from './deplyoment-card.component';
import { OperationDeploymentsComponent } from './operation-deployments.component';
import { SignedInRescueStationsComponent } from './signed-in-rescue-stations.component';
import { SignedOffDeploymentsComponent } from './signed-off-deployments.component';

@Component({
	selector: 'krd-deployments',
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
		OperationDeploymentsComponent,
		NzTooltipDirective,
	],
	providers: [DeploymentsSearchStateService],
	templateUrl: './deployments.component.html',
	styleUrl: './deployments.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeploymentsComponent {
	readonly searchStateService = inject(DeploymentsSearchStateService);

	private readonly modalService = inject(NzModalService);
	private readonly notificationService = inject(NzNotificationService);
	private readonly gqlService = inject(GraphqlService);
	private readonly multiSubscriptionService = inject(MultiSubscriptionService);
	private readonly deploymentsQuery = this.gqlService.query<{
		signedInStations: Query['rescueStationDeployments'];
		signedOffStations: Query['rescueStationDeployments'];
		unassignedEntities: Query['unassignedEntities'];
		operationDeployments: Query['operationDeployments'];
	}>(DEPLOYMENTS_QUERY);
	readonly deployments = toSignal(
		this.deploymentsQuery.$.pipe(takeUntilDestroyed()),
		{
			initialValue: {
				signedInStations: [],
				signedOffStations: [],
				unassignedEntities: [],
				operationDeployments: [],
			},
		},
	);

	constructor(iconService: NzIconService) {
		iconService.addIcon(
			InfoCircleOutline,
			UndoOutline,
			EditOutline,
			CloseOutline,
		);

		// right now we greedily get all deployments, as a change in a deployment or a unit can result in changes in multiple deployment
		// a better way would be to have more fine events for all actions taken that could replay the action in the frontend
		this.multiSubscriptionService
			.subscribeToMultiple$([
				'signedInRescueStationUpdated',
				'rescueStationSignedOff',
				'rescueStationSignedIn',
				'operationDeploymentCreated',
				'operationDeploymentUpdated',
			])
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
