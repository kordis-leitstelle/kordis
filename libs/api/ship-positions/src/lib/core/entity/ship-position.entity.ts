import { AutoMap } from '@automapper/classes';
import { Field, ObjectType } from '@nestjs/graphql';
import { Feature, Point } from '@turf/turf';

@ObjectType()
export class ShipPositionFeatureProperties {
	@Field()
	@AutoMap()
	mmsi: string;
	@Field()
	@AutoMap()
	createdAt: Date;
	@Field({ nullable: true })
	@AutoMap()
	callSign?: string;
	@Field({ nullable: true })
	@AutoMap()
	name?: string;
	@Field({ nullable: true })
	@AutoMap()
	length?: number;
	@Field({ nullable: true })
	@AutoMap()
	width?: number;
	@Field({ nullable: true })
	@AutoMap()
	heading?: number;
	@Field({ nullable: true })
	@AutoMap()
	sog?: number;
	@Field({ nullable: true })
	@AutoMap()
	cog?: number;
	@Field({ nullable: true })
	@AutoMap()
	turningRate?: number;
	@Field({ nullable: true })
	@AutoMap()
	class?: string;
	@Field({ nullable: true })
	@AutoMap()
	subClass?: string;
}

@ObjectType()
class PointGeometry implements Point {
	@Field()
	readonly type: 'Point' = 'Point' as const;
	@Field(() => [Number, Number])
	coordinates: [number, number];
}

@ObjectType()
export class ShipPositionFeature
	implements Feature<Point, ShipPositionFeatureProperties>
{
	@Field()
	readonly type: 'Feature' = 'Feature' as const;
	@Field(() => PointGeometry)
	geometry: PointGeometry;
	@Field(() => ShipPositionFeatureProperties)
	properties: ShipPositionFeatureProperties;
}
