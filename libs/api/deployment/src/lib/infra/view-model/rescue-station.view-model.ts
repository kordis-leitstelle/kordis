import { Field, ObjectType } from '@nestjs/graphql';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';
import { RescueStationDeploymentEntity } from '../../core/entity/rescue-station-deployment.entity';
import { DeploymentAssignment } from './abstract-deployment.view-model';

@ObjectType('RescueStationDeployment')
export class RescueStationDeploymentViewModel extends RescueStationDeploymentEntity {
	@Field(() => [DeploymentAssignment])
	assignments: (DeploymentUnit | DeploymentAlertGroup)[];
}
