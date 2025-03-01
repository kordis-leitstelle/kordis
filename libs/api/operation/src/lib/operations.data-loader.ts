import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { DataLoaderContainer } from '@kordis/api/shared';

import { GetOperationsByIdsQuery } from './core/query/get-operations-by-ids.query';

export const OPERATION_DATA_LOADER = Symbol('OPERATION_DATA_LOADER');

@Injectable()
export class OperationsDataLoader {
	constructor(loaderContainer: DataLoaderContainer, bus: QueryBus) {
		loaderContainer.registerLoadingFunction(
			OPERATION_DATA_LOADER,
			async (operationIds: readonly string[]) =>
				bus.execute(
					new GetOperationsByIdsQuery(operationIds as string[], {
						retainOrder: true,
					}),
				),
		);
	}
}
