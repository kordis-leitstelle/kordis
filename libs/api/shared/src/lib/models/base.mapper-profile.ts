import { MappingConfiguration, extend } from '@automapper/core';
import { AutomapperProfile } from '@automapper/nestjs';

import { BaseDocument } from './base-document.model';
import { BaseEntityModel } from './base-entity.model';

export abstract class BaseMapperProfile extends AutomapperProfile {
	protected override get mappingConfigurations(): MappingConfiguration[] {
		return [extend(BaseDocument, BaseEntityModel)];
	}
}
