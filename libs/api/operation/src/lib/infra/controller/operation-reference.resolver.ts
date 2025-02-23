import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { DataLoaderContextProvider } from '@kordis/api/shared';
import {
	ALERT_GROUPS_DATA_LOADER,
	AlertGroupViewModel,
	UNITS_DATA_LOADER,
	UnitViewModel,
} from '@kordis/api/unit';

import {
	OperationAlertGroupInvolvement,
	OperationUnitInvolvement,
} from '../../core/entity/operation.value-objects';

@Resolver(() => OperationUnitInvolvement)
export class OperationUnitInvolvementResolver {
	@ResolveField()
	unit(
		@Parent() { unit }: OperationUnitInvolvement,
		@Context()
		{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<UnitViewModel> {
		const loader = loadersProvider.getLoader<string, UnitViewModel>(
			UNITS_DATA_LOADER,
		);
		return loader.load(unit.id);
	}
}

@Resolver(() => OperationAlertGroupInvolvement)
export class OperationAlertGroupInvolvementResolver {
	@ResolveField()
	alertGroup(
		@Parent() { alertGroup }: OperationAlertGroupInvolvement,
		@Context()
		{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<AlertGroupViewModel> {
		const loader = loadersProvider.getLoader<string, AlertGroupViewModel>(
			ALERT_GROUPS_DATA_LOADER,
		);
		return loader.load(alertGroup.id);
	}
}
