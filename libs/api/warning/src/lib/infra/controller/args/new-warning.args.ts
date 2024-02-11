import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { Validate, ValidateNested } from 'class-validator';

import { BBox, IsBBox } from '@kordis/api/geospatial';

@ArgsType()
export class NewWarningArgs {
	@ValidateNested()
	@Validate(IsBBox, {
		message:
			'Für das Begrenzungsrechteck müssen die Ecken oben links und unten rechts angegeben werden.',
	})
	@Type(() => BBox)
	@Field()
	bbox: BBox;
}
