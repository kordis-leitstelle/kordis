import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { DataLoaderContainer } from '@kordis/api/shared';

import { GetUnitsByIdsQuery } from '../core/query/get-units-by-ids.query';

export const UNITS_DATA_LOADER = Symbol('UNITS_DATA_LOADER');

@Injectable()
export class UnitsDataLoader {
	constructor(loaderContainer: DataLoaderContainer, bus: QueryBus) {
		loaderContainer.registerLoadingFunction(
			UNITS_DATA_LOADER,
			async (unitIds: readonly string[]) =>
				bus.execute(new GetUnitsByIdsQuery(unitIds as string[])),
		);
	}
}
