import { Field, ObjectType } from '@nestjs/graphql';

import {
	DeploymentAlertGroup,
	DeploymentUnit,
} from '../../core/entity/deployment.entity';
import { OperationDeploymentEntity } from '../../core/entity/operation-deplyoment.entity';
import {
	DeploymentAssignment,
	DeploymentViewModel,
} from './abstract-deployment.view-model';

@ObjectType('OperationDeployment')
export class OperationDeploymentViewModel
	extends OperationDeploymentEntity
	implements DeploymentViewModel
{
	@Field(() => [DeploymentAssignment])
	assignments: (DeploymentUnit | DeploymentAlertGroup)[];
}
