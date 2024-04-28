import { Mapper, createMap } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';

import { BaseMapperProfile } from '@kordis/api/shared';

import { AlertGroupEntity } from '../../core/entity/alert-group.entity';
import { AlertGroupDocument } from '../schema/alert-group.schema';

@Injectable()
export class AlertGroupProfile extends BaseMapperProfile {
	constructor(@Inject(getMapperToken()) mapper: Mapper) {
		super(mapper);
	}

	override get profile() {
		return (mapper: Mapper): void => {
			createMap(mapper, AlertGroupDocument, AlertGroupEntity);
		};
	}
}
