import { AutoMap } from '@automapper/classes';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class RescueStationMessageStrengthDocument {
	@Prop()
	@AutoMap()
	leaders: number;

	@Prop()
	@AutoMap()
	subLeaders: number;

	@Prop()
	@AutoMap()
	helpers: number;
}

@Schema({ _id: false })
export class RescueStationMessageAssignedUnitDocument {
	@Prop()
	@AutoMap()
	id: string;

	@Prop()
	@AutoMap()
	name: string;

	@Prop()
	@AutoMap()
	callSign: string;
}

@Schema({ _id: false })
export class RescueStationMessageAssignedAlertGroupDocument {
	@Prop()
	@AutoMap()
	id: string;

	@Prop()
	@AutoMap()
	name: string;

	@Prop({ type: [RescueStationMessageAssignedUnitDocument] })
	@AutoMap(() => [RescueStationMessageAssignedUnitDocument])
	units: RescueStationMessageAssignedUnitDocument[];
}

@Schema({ _id: false })
export class RescueStationMessagePayloadDocument {
	@Prop()
	@AutoMap()
	rescueStationId: string;

	@Prop()
	@AutoMap()
	rescueStationName: string;

	@Prop()
	@AutoMap()
	rescueStationCallSign: string;

	@Prop({ type: RescueStationMessageStrengthDocument })
	@AutoMap()
	strength: RescueStationMessageStrengthDocument;

	@Prop({ type: [RescueStationMessageAssignedUnitDocument] })
	@AutoMap(() => [RescueStationMessageAssignedUnitDocument])
	units: RescueStationMessageAssignedUnitDocument[];

	@Prop({ type: [RescueStationMessageAssignedAlertGroupDocument] })
	@AutoMap(() => [RescueStationMessageAssignedAlertGroupDocument])
	alertGroups: RescueStationMessageAssignedAlertGroupDocument[];
}
