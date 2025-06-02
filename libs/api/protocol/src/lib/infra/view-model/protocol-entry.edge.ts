import { Field, ObjectType } from '@nestjs/graphql';
import { EdgeInterface } from 'nestjs-graphql-connection';
import { Initializable } from 'ts-class-initializable';

import { ProtocolEntryBase } from '../../core/entity/protocol-entries/protocol-entry.entity';
import { ProtocolEntryUnion } from '../../core/entity/protocol.entity';

@ObjectType()
export class ProtocolEntryEdge
	extends Initializable<EdgeInterface<ProtocolEntryBase>>
	implements EdgeInterface<ProtocolEntryBase>
{
	@Field(() => ProtocolEntryUnion, {
		description: `The node object (belonging to type ProtocolEntryUnion) attached to the edge.`,
	})
	public node: ProtocolEntryBase;

	@Field(() => String, {
		description:
			'An opaque cursor that can be used to retrieve further pages of edges before or after this one.',
	})
	public cursor: string;
}
