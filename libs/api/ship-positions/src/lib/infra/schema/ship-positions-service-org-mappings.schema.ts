import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Providers } from '../provider/providers.type';

@Schema({ collection: 'shipPositionsServiceOrgMappings' })
export class ShipPositionsServiceOrgMappingsDocument {
	@Prop({ unique: true })
	orgId: string;
	@Prop({ type: String })
	provider: Providers;
}

export const ShipPositionsServiceOrgMappingsSchema =
	SchemaFactory.createForClass(ShipPositionsServiceOrgMappingsDocument);
