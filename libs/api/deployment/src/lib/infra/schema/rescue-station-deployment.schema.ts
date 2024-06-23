import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Coordinate } from '@kordis/api/shared';

import { RescueStationStrength as RescueStationStrengthValueObject } from '../../core/entity/rescue-station-deployment.entity';
import { DeploymentDocumentContract } from './deployment.schema';

@Schema()
export class RescueStationStrength {
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

const RescueStationStrengthSchema = SchemaFactory.createForClass(
	RescueStationStrength,
);

const RescueStationCoordinatesSchema = SchemaFactory.createForClass(Coordinate);

@Schema()
export class RescueStationAddress {
	@Prop()
	@AutoMap()
	street: string;

	@Prop()
	@AutoMap()
	city: string;

	@Prop()
	@AutoMap()
	postalCode: string;
}

const RescueStationAddressSchema =
	SchemaFactory.createForClass(RescueStationAddress);

@Schema()
export class RescueStationLocation {
	@Prop({ type: RescueStationCoordinatesSchema })
	coordinate: Coordinate;

	@Prop({ type: RescueStationAddressSchema })
	address: RescueStationAddress;
}

const RescueStationLocationSchema = SchemaFactory.createForClass(
	RescueStationLocation,
);

@Schema()
export class RescueStationDeploymentDocument extends DeploymentDocumentContract {
	@Prop()
	@AutoMap()
	callSign: string;

	@Prop({ type: RescueStationStrengthSchema })
	@AutoMap(() => RescueStationStrengthValueObject)
	strength: RescueStationStrength;

	@Prop()
	@AutoMap()
	note: string;

	@Prop()
	@AutoMap()
	signedIn: boolean;

	@Prop({ type: RescueStationLocationSchema })
	@AutoMap(() => RescueStationLocation)
	location: RescueStationLocation;

	@Prop()
	@AutoMap()
	defaultUnitIds: string[];
}

export const RescueStationDeploymentSchema = SchemaFactory.createForClass(
	RescueStationDeploymentDocument,
);
