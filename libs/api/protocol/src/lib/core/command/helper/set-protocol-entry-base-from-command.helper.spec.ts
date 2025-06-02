import { AuthUser } from '@kordis/shared/model';

import { UserProducer } from '../../entity/partials/producer-partial.entity';
import { RegisteredUnit } from '../../entity/partials/unit-partial.entity';
import { ProtocolEntryBase } from '../../entity/protocol-entries/protocol-entry.entity';
import { BaseCreateProtocolEntryCommand } from '../base-create-protocol-entry.command';
import { setProtocolEntryBaseFromCommandHelper } from './set-protocol-entry-base-from-command.helper';

// Mock class for testing
class MockProtocolEntry extends ProtocolEntryBase {}

describe('setProtocolEntryBaseFromCommandHelper', () => {
	let entity: MockProtocolEntry;
	let mockTime: Date;
	let mockUser: AuthUser;

	// Helper function to create a mock command
	const createMockCommand = (
		protocolData: any,
	): BaseCreateProtocolEntryCommand => {
		return {
			time: mockTime,
			protocolData,
			requestUser: mockUser,
		} as BaseCreateProtocolEntryCommand;
	};

	// Helper function to verify common expectations
	const expectCommonAssertions = (
		cmd: BaseCreateProtocolEntryCommand,
		entity: MockProtocolEntry,
	) => {
		// Verify that the entity properties were set correctly
		expect(entity.time).toEqual(cmd.time);
		expect(entity.communicationDetails).toEqual(cmd.protocolData);
		expect(entity.orgId).toEqual(cmd.requestUser.organizationId);

		// Verify that the producer was created and set correctly
		const expectedProducer = new UserProducer();
		expectedProducer.userId = cmd.requestUser.id;
		expectedProducer.firstName = cmd.requestUser.firstName;
		expectedProducer.lastName = cmd.requestUser.lastName;

		expect(entity.producer).toEqual(expectedProducer);
	};

	beforeEach(() => {
		// Common setup for all tests
		entity = new MockProtocolEntry();
		mockTime = new Date();
		mockUser = {
			id: 'userId',
			firstName: 'firstName',
			lastName: 'lastName',
			organizationId: 'orgId',
		} as AuthUser;
	});

	// eslint-disable-next-line jest/expect-expect
	it('should set base data from command on entity', () => {
		// Create a mock command with protocol data
		const protocolData = {
			sender: new RegisteredUnit(),
			recipient: new RegisteredUnit(),
			channel: 'test-channel',
		};
		const cmd = createMockCommand(protocolData);

		// Call the helper function
		setProtocolEntryBaseFromCommandHelper(cmd, entity);

		// Verify expectations
		expectCommonAssertions(cmd, entity);
	});

	// eslint-disable-next-line jest/expect-expect
	it('should handle null protocolData', () => {
		// Create a mock command with null protocolData
		const cmd = createMockCommand(null);

		// Call the helper function
		setProtocolEntryBaseFromCommandHelper(cmd, entity);

		// Verify expectations
		expectCommonAssertions(cmd, entity);
	});
});
