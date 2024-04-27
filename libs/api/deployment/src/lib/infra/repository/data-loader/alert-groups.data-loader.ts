import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { DataLoaderContainer } from '@kordis/api/shared';
import { GetAlertGroupsByIdsQuery } from '@kordis/api/unit';

export const ALERT_GROUPS_DATA_LOADER = Symbol('ALERT_GROUPS_DATA_LOADER');

@Injectable()
export class AlertGroupsDataLoader {
	constructor(loaderContainer: DataLoaderContainer, bus: QueryBus) {
		loaderContainer.registerLoadingFunction(
			ALERT_GROUPS_DATA_LOADER,
			async (alertGroupIds: readonly string[]) =>
				bus.execute(new GetAlertGroupsByIdsQuery(alertGroupIds as string[])),
		);
	}
}
