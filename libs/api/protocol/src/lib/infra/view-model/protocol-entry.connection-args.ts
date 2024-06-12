import { ArgsType, OmitType } from '@nestjs/graphql';
import { ConnectionArgs } from 'nestjs-graphql-connection';

@ArgsType()
export class ProtocolEntryConnectionArgs extends OmitType(ConnectionArgs, [
	'page',
] as const) {}
