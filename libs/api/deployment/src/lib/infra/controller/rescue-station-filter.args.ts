import { AutoMap } from '@automapper/classes';
import { ArgsType, Field } from '@nestjs/graphql';

import { RescueStationEntityDTO } from '../../core/repository/rescue-station-deployment.repository';

@ArgsType()
export class RescueStationFilterArgs
	implements Partial<RescueStationEntityDTO>
{
	@Field({ nullable: true })
	@AutoMap()
	signedIn?: boolean;
}
