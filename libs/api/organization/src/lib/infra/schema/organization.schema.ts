import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseDocument } from '@kordis/api/shared';

@Schema({ id: false })
export class Coordinate {
	@Prop()
	lat: number;
	@Prop()
	lon: number;
}

@Schema({ id: false })
export class BBox {
	@Prop()
	topLeft: Coordinate;
	@Prop()
	bottomRight: Coordinate;
}

@Schema({ id: false })
export class OrganizationGeoSettings {
	@Prop()
	centroid: Coordinate;
	@Prop()
	bbox: BBox;
}

@Schema({ timestamps: true, collection: 'organizations' })
export class OrganizationDocument extends BaseDocument {
	@Prop({ unique: true })
	name: string;

	@Prop()
	geoSettings: OrganizationGeoSettings;
}

export const OrganizationSchema =
	SchemaFactory.createForClass(OrganizationDocument);
