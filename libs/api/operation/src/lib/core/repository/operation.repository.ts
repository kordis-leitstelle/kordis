import { Operation } from '../entity/operation.entity';

export const OPERATION_REPOSITORY = Symbol('OperationRepository');

export interface OperationRepository {
	create(org: Operation): Promise<Operation>;

	getLatestOperationSign(orgId: string): Promise<string | undefined>;
}
