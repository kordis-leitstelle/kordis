import { Injectable, inject } from '@angular/core';
import { Popup } from 'maplibre-gl';

import { Query, RescueStationDeployment } from '@kordis/shared/model';
import {
	GraphqlService,
	SubscriptionField,
	gql,
} from '@kordis/spa/core/graphql';

import { AbstractStationLayerManager } from './station-layer-manager.service';

@Injectable()
export class SignedOffStationLayerManager extends AbstractStationLayerManager {
	name = 'Ausgemeldete Stationen';
	defaultActive = false;
	iconPath = '/assets/map-icons/station-signedoff.png';
	query = inject(GraphqlService).query<{
		rescueStationDeployments: Query['rescueStationDeployments'];
	}>(gql`
		query {
			rescueStationDeployments(signedIn: false) {
				id
				name
				location {
					coordinate {
						lat
						lon
					}
				}
			}
		}
	`);

	subscriptionFields: SubscriptionField[] = [
		'rescueStationSignedOff',
		'rescueStationSignedIn',
		{ field: 'rescueStationsReset', queryFields: null },
	];

	protected makePopup(): Popup {
		return new Popup({
			closeButton: false,
			offset: 15,
		});
	}

	protected setPopupContent(station: RescueStationDeployment): void {
		this.popup.setText(station.name + ' - Ausgemeldet');
	}
}
