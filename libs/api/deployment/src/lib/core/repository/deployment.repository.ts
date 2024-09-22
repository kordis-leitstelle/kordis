import { DbSessionProvider } from '@kordis/api/shared';

import { BaseDeploymentEntity } from '../entity/deployment.entity';

export interface DeploymentRepository<
	T extends BaseDeploymentEntity,
	TDto extends Partial<T>,
> {
	findById(orgId: string, id: string): Promise<T>;

	findByOrgId(
		orgId: string,
		filter?: Partial<TDto>,
		uow?: DbSessionProvider,
	): Promise<T[]>;

	updateOne(
		orgId: string,
		id: string,
		data: Partial<TDto>,
		uow?: DbSessionProvider,
	): Promise<void>;
}
