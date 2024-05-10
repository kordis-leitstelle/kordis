import { createUnionType } from '@nestjs/graphql';

import { CommunicationMessage } from './protocol-entries/communication-message.entity';

export const ProtocolEntryUnion = createUnionType({
	name: 'ProtocolEntryUnion',
	types: () => [CommunicationMessage] as const,
});
