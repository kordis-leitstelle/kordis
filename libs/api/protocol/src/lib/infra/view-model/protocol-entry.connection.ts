import { ObjectType } from '@nestjs/graphql';
import { createConnectionType } from 'nestjs-graphql-connection';

import { ProtocolEntryEdge } from './protocol-entry.edge';

@ObjectType()
export class ProtocolEntryConnection extends createConnectionType(
	ProtocolEntryEdge,
) {}
