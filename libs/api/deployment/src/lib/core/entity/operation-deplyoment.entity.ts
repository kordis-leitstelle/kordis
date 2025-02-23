import { Field, ObjectType } from '@nestjs/graphql';

import { OperationViewModel } from '@kordis/api/operation';

import { BaseDeploymentEntity } from './deployment.entity';

@ObjectType({ isAbstract: true })
export class OperationDeploymentEntity extends BaseDeploymentEntity {
	@Field(() => OperationViewModel)
	operation: { id: string };
}
