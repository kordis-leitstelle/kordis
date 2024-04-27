import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BaseDocument } from '@kordis/api/shared';

import { DeploymentType } from './deployment-type.enum';

// we need this class, since the discriminator documents can not extend from DeploymentDocument directly as they inherit the metadata
export abstract class DeploymentDocumentContract
	extends BaseDocument
	implements BaseDeploymentDocument
{
	@AutoMap()
	name: string;
	type: string;
	referenceId: string;
}

@Schema({
	discriminatorKey: 'type',
	timestamps: true,
	collection: 'deployments',
})
export class BaseDeploymentDocument extends BaseDocument {
	@Prop()
	name: string;

	@Prop({ type: String, enum: Object.values(DeploymentType) })
	type: string;

	@Prop({ index: true })
	referenceId: string;
}

export const DeploymentSchema = SchemaFactory.createForClass(
	BaseDeploymentDocument,
);

DeploymentSchema.index({ orgId: 1, referenceId: 1 }, { unique: true });
