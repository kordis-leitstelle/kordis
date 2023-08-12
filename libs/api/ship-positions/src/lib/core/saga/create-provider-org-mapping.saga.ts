import { Injectable } from '@nestjs/common';
import { ICommand, IEvent, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';

import { OrganizationCreatedEvent } from '@kordis/api/organization';

import { UpsertOrgShipPositionsProviderCommand } from '../command/upsert-org-ship-positions-provider.command';

@Injectable()
export class CreateProviderOrgMappingSaga {
	@Saga()
	orgCreated = (events$: Observable<IEvent>): Observable<ICommand> =>
		events$.pipe(
			ofType(OrganizationCreatedEvent),
			map(
				(event) =>
					// as a default, organisations first have no active Ship Positions provider
					new UpsertOrgShipPositionsProviderCommand(event.org.id, 'none'),
			),
		);
}
