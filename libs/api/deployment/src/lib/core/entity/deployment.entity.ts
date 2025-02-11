import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { BaseEntityModel } from '@kordis/api/shared';
import { AlertGroupViewModel, UnitViewModel } from '@kordis/api/unit';

@ObjectType()
export class DeploymentUnit {
	@Field(() => UnitViewModel)
	unit: { id: string };
}

@ObjectType()
export class DeploymentAlertGroup {
	@Field(() => AlertGroupViewModel)
	alertGroup: { id: string };

	@Field(() => [DeploymentUnit])
	assignedUnits: DeploymentUnit[];
}

@ObjectType({ isAbstract: true })
export class BaseDeploymentEntity extends BaseEntityModel {
	@ValidateNested({ each: true })
	@Type(() => DeploymentUnit)
	assignedUnits: DeploymentUnit[];

	@ValidateNested({ each: true })
	@Type(() => DeploymentAlertGroup)
	assignedAlertGroups: DeploymentAlertGroup[];
}
