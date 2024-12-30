import { AutoMap } from '@automapper/classes';

import { DbSessionProvider } from '@kordis/api/shared';

import {
	RescueStationDeploymentEntity,
	RescueStationStrength,
} from '../entity/rescue-station-deployment.entity';
import { DeploymentRepository } from './deployment.repository';

export const RESCUE_STATION_DEPLOYMENT_REPOSITORY = Symbol(
	'RESCUE_STATION_DEPLOYMENT_REPOSITORY',
);

// this dto is for use in the core layer, as it covers entity fields, that will be mapped to the document dto.
export class RescueStationEntityDTO
	implements Partial<RescueStationDeploymentEntity>
{
	@AutoMap()
	note: string;
	@AutoMap()
	strength: RescueStationStrength;
	@AutoMap()
	signedIn: boolean;
	@AutoMap()
	defaultUnitIds: string[];
}

export interface RescueStationDeploymentRepository
	extends DeploymentRepository<
		RescueStationDeploymentEntity,
		RescueStationEntityDTO
	> {
	updateAll(
		orgId: string,
		data: Partial<RescueStationEntityDTO>,
		uow?: DbSessionProvider,
	): Promise<void>;
}
