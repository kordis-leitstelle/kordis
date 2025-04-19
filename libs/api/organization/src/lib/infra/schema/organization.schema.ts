import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseDocument, Coordinate } from '@kordis/api/shared';

@Schema({ _id: false })
export class BBox {
	@Prop()
	@AutoMap()
	topLeft: Coordinate;
	@Prop()
	@AutoMap()
	bottomRight: Coordinate;
}

@Schema({ _id: false })
export class MapStyles {
	@Prop()
	@AutoMap()
	streetUrl: string;

	@Prop()
	@AutoMap()
	satelliteUrl: string;

	@Prop()
	@AutoMap()
	darkUrl: string;
}

@Schema({ _id: false })
export class MapLayer {
	@Prop()
	@AutoMap()
	name: string;

	@Prop()
	@AutoMap()
	wmsUrl: string;

	@Prop()
	@AutoMap()
	defaultActive: boolean;
}

@Schema({ _id: false })
export class OrganizationGeoSettings {
	@Prop()
	@AutoMap()
	centroid: Coordinate;

	@Prop()
	@AutoMap()
	bbox: BBox;

	@Prop()
	@AutoMap()
	mapStyles: MapStyles;

	@Prop()
	@AutoMap(() => [MapLayer])
	mapLayers: MapLayer[];
}

@Schema({ timestamps: true, collection: 'organizations' })
export class OrganizationDocument extends BaseDocument {
	@Prop({ unique: true })
	@AutoMap()
	name: string;

	@Prop()
	@AutoMap()
	geoSettings: OrganizationGeoSettings;
}

export const OrganizationSchema =
	SchemaFactory.createForClass(OrganizationDocument);

OrganizationSchema.pre('save', function (next) {
	if (this.isNew) {
		this.orgId = this._id.toString();
	}
	next();
});
