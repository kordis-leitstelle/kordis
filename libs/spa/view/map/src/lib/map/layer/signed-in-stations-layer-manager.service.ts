import {
	Component,
	Injectable,
	ViewContainerRef,
	inject,
	input,
} from '@angular/core';
import { Popup } from 'maplibre-gl';

import { Query, RescueStationDeployment } from '@kordis/shared/model';
import {
	GraphqlService,
	SubscriptionField,
	gql,
} from '@kordis/spa/core/graphql';
import {
	ASSIGNMENT_QUERY_FIELDS,
	DeploymentCardComponent,
	RescueStationDeploymentCardHeaderComponent,
	UNIT_FRAGMENT,
} from '@kordis/spa/feature/deployment';

import {
	MapComponentPopup,
	MapPopupComponent,
} from '../popup/map-component-popup';
import { AbstractStationLayerManager } from './station-layer-manager.service';

@Component({
	imports: [
		DeploymentCardComponent,
		RescueStationDeploymentCardHeaderComponent,
	],
	template: `
		<krd-deployment-card
			[clickable]="false"
			[name]="stationDeployment().name"
			[assignments]="stationDeployment().assignments"
		>
			<krd-rescue-station-deployment-card-header
				role="sub-header"
				[rescueStation]="stationDeployment()"
			/>
		</krd-deployment-card>
	`,
})
class StationPopupComponent extends MapPopupComponent {
	readonly stationDeployment = input.required<RescueStationDeployment>();
}

@Injectable()
export class SignedInStationLayerManager extends AbstractStationLayerManager {
	name = 'Eingemeldete Stationen';
	defaultActive = true;
	iconPath = '/assets/map-icons/station-signedin.png';
	query = inject(GraphqlService).query<{
		rescueStationDeployments: Query['rescueStationDeployments'];
	}>(gql`
		${UNIT_FRAGMENT}
		query {
			rescueStationDeployments(signedIn: true) {
				id
				name
				location {
					address {
						street
					}
					coordinate {
						lat
						lon
					}
				}
				strength {
					helpers
					leaders
					subLeaders
				}
				assignments {
					${ASSIGNMENT_QUERY_FIELDS}
				}
			}
		}
  `);
	subscriptionFields: SubscriptionField[] = [
		'signedInRescueStationUpdated',
		'rescueStationSignedIn',
		{ field: 'rescueStationsReset', queryFields: null },
	];

	protected setPopupContent(station: RescueStationDeployment): void {
		(this.popup as MapComponentPopup<StationPopupComponent>).setComponent(
			StationPopupComponent,
			{
				stationDeployment: station,
			},
		);
	}

	protected makePopup(): Popup {
		return new MapComponentPopup(inject(ViewContainerRef), {
			closeButton: false,
			offset: 15,
			className: 'no-padding-popup',
		});
	}
}
