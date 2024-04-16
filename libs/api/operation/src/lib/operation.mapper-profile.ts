import type { Mapper } from '@automapper/core';
import { createMap } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { BaseMapperProfile } from '@kordis/api/shared';

import { Operation } from './core/entity/operation.entity';
import { OperationDocument } from './infra/schema/operation.schema';

@Injectable()
export class OperationProfile extends BaseMapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, OperationDocument, Operation);
		};
	}
}
