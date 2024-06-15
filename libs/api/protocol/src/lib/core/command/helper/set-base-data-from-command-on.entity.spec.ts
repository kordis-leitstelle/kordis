import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../../entity/partials/producer-partial.entity';
import {
	RegisteredUnit,
	UnknownUnit,
} from '../../entity/partials/unit-partial.entity';
import { ProtocolCommunicationEntryBase } from '../../entity/protocol-entries/protocol-entry-base.entity';
import { BaseCreateMessageCommand } from '../base-create-message.command';
import { setBaseDataFromCommandOnEntity } from './set-base-data-from-command-on.entity';

class MockBaseCreateMessageCommand implements BaseCreateMessageCommand {
	time: Date;
	sender: RegisteredUnit | UnknownUnit;
	recipient: RegisteredUnit | UnknownUnit;
	channel: string;
	requestUser: AuthUser;
}

class MockProtocolCommunicationEntryBase extends ProtocolCommunicationEntryBase {}

describe('setBaseDataFromCommandOnEntity', () => {
	it('should set base data from command on entity', () => {
		const cmd = new MockBaseCreateMessageCommand();
		cmd.time = new Date();
		const sender = new RegisteredUnit();
		sender.unit = { id: 'senderId' };
		cmd.sender = sender;
		const recipient = new RegisteredUnit();
		recipient.unit = { id: 'recipientId' };
		cmd.recipient = recipient;
		cmd.channel = 'channel';
		cmd.requestUser = {
			id: 'userId',
			firstName: 'firstName',
			lastName: 'lastName',
			organizationId: 'orgId',
		} as AuthUser;

		const entity = new MockProtocolCommunicationEntryBase();

		setBaseDataFromCommandOnEntity(cmd, entity);

		expect(entity.time).toEqual(cmd.time);
		expect(entity.sender).toEqual(cmd.sender);
		expect(entity.recipient).toEqual(cmd.recipient);
		expect(entity.channel).toEqual(cmd.channel);
		expect(entity.orgId).toEqual(cmd.requestUser.organizationId);

		const producer = new UserProducer();
		producer.userId = cmd.requestUser.id;
		producer.firstName = cmd.requestUser.firstName;
		producer.lastName = cmd.requestUser.lastName;

		expect(entity.producer).toEqual(producer);
	});
});
