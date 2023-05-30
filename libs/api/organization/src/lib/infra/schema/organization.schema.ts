import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

@Schema({ id: false })
export class OrganizationSettings {
	@Prop()
	geo: OrganizationGeoSettings;
}

@Schema()
export class Organization extends Document {
	@Prop({ unique: true })
	name: string;

	@Prop()
	settings: OrganizationSettings;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
