import { DbSessionProvider } from '@kordis/api/shared';

import { OperationEntity } from '../entity/operation.entity';
import { CreateOperationDto } from './dto/create-operation.dto';
import { OperationFilterDto } from './dto/operation-filter.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';

export const OPERATION_REPOSITORY = Symbol('OPERATION_REPOSITORY');

export interface OperationRepository {
	create(
		orgId: string,
		dto: CreateOperationDto,
		uow?: DbSessionProvider,
	): Promise<{ id: string }>;

	findById(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<OperationEntity>;

	findByOrgId(
		orgId: string,
		filter?: Partial<OperationFilterDto>,
		sortBySignDesc?: boolean,
	): Promise<OperationEntity[]>;

	findLatestOperationSign(
		orgId: string,
		uow?: DbSessionProvider,
	): Promise<string | undefined>;

	update(
		orgId: string,
		operationId: string,
		data: Partial<UpdateOperationDto>,
		uow?: DbSessionProvider,
	): Promise<void>;
}
