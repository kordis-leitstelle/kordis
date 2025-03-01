import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { DataLoaderContextProvider } from '@kordis/api/shared';
import {
	ALERT_GROUPS_DATA_LOADER,
	AlertGroupViewModel,
	UNITS_DATA_LOADER,
	UnitViewModel,
} from '@kordis/api/unit';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';

@Resolver(() => DeploymentUnit)
export class DeploymentUnitResolver {
	@ResolveField()
	async unit(
		@Parent() { unit }: DeploymentUnit,
		@Context()
		{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<UnitViewModel> {
		const loader = loadersProvider.getLoader<string, UnitViewModel>(
			UNITS_DATA_LOADER,
		);
		return loader.load(unit.id);
	}
}

@Resolver(() => DeploymentAlertGroup)
export class DeploymentAlertGroupResolver {
	@ResolveField()
	async alertGroup(
		@Parent() { alertGroup }: DeploymentAlertGroup,
		@Context()
		{ loadersProvider }: { loadersProvider: DataLoaderContextProvider },
	): Promise<AlertGroupViewModel> {
		const loader = loadersProvider.getLoader<string, AlertGroupViewModel>(
			ALERT_GROUPS_DATA_LOADER,
		);
		return loader.load(alertGroup.id);
	}
}
