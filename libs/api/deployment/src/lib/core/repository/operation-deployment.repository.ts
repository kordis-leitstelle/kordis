import { DbSessionProvider } from '@kordis/api/shared';

import { OperationDeploymentEntity } from '../entity/operation-deplyoment.entity';
import { DeploymentRepository } from './deployment.repository';

export const OPERATION_DEPLOYMENT_REPOSITORY = Symbol(
	'OPERATION_DEPLOYMENT_REPOSITORY',
);

export interface OperationDeploymentRepository
	extends DeploymentRepository<
		OperationDeploymentEntity,
		OperationDeploymentEntity
	> {
	create(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<OperationDeploymentEntity>;

	findByOperationId(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<OperationDeploymentEntity>;
}
