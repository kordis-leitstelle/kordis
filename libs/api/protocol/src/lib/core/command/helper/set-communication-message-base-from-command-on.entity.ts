import { UserProducer } from '../../entity/partials/producer-partial.entity';
import { ProtocolCommunicationEntryBase } from '../../entity/protocol-entries/protocol-entry-base.entity';
import { BaseCreateCommunicationMessageCommand } from '../base-create-communication-message.command';

export function setCommunicationMessageBaseFromCommandOnEntity(
	cmd: BaseCreateCommunicationMessageCommand,
	entity: ProtocolCommunicationEntryBase,
): void {
	const producer = new UserProducer();
	producer.userId = cmd.requestUser.id;
	producer.firstName = cmd.requestUser.firstName;
	producer.lastName = cmd.requestUser.lastName;

	entity.time = cmd.time;
	entity.sender = cmd.sender;
	entity.recipient = cmd.recipient;
	entity.producer = producer;
	entity.channel = cmd.channel;
	entity.orgId = cmd.requestUser.organizationId;
}
