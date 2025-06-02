import { UserProducer } from '../../entity/partials/producer-partial.entity';
import { ProtocolEntryBase } from '../../entity/protocol-entries/protocol-entry.entity';
import { BaseCreateProtocolEntryCommand } from '../base-create-protocol-entry.command';

export function setProtocolEntryBaseFromCommandHelper(
	cmd: BaseCreateProtocolEntryCommand,
	entity: ProtocolEntryBase,
): void {
	const producer = new UserProducer();
	producer.userId = cmd.requestUser.id;
	producer.firstName = cmd.requestUser.firstName;
	producer.lastName = cmd.requestUser.lastName;

	entity.time = cmd.time;
	entity.producer = producer;
	entity.orgId = cmd.requestUser.organizationId;
	entity.communicationDetails = cmd.protocolData;
}
