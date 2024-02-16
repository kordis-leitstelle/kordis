import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { Role } from '@kordis/shared/model';

export const METADATA_ROLE_KEY = 'MINIMUM_ROLE';
export const MinimumRole = (minimumRole: Role): CustomDecorator =>
	SetMetadata(METADATA_ROLE_KEY, minimumRole);
