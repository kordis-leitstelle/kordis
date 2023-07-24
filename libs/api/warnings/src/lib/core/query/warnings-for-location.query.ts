import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Warning } from '../model/warning.model';
import { WARNING_SERVICE, WarningsService } from '../service/warnings.service';

export class WarningsForLocationQuery implements IQuery {
	constructor(readonly lat: number, readonly lon: number) {}
}

@QueryHandler(WarningsForLocationQuery)
export class WarningsForLocationHandler
	implements IQueryHandler<WarningsForLocationQuery>
{
	constructor(
		@Inject(WARNING_SERVICE) private readonly warningService: WarningsService,
	) {}

	async execute({ lat, lon }: WarningsForLocationQuery): Promise<Warning[]> {
		return this.warningService.getWarningsForLocation(lat, lon);
	}
}
