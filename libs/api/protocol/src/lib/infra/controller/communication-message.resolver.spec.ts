import { createMock } from '@golevelup/ts-jest';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import { AuthUser } from '@kordis/shared/model';

import { CommunicationMessage } from '../../core/entity/protocol-entries/communication-message.entity';
import { UnitInput, UnitInputType } from '../view-model/unit-input.view-model';
import { CommunicationMessageResolver } from './communication-message.resolver';

describe('CommunicationMessageResolver', () => {
	let resolver: CommunicationMessageResolver;
	const mockCommandBus = createMock<CommandBus>();
	const fakeTime = new Date('1913-10-19');

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CommunicationMessageResolver,
				{ provide: CommandBus, useValue: mockCommandBus },
			],
		}).compile();

		resolver = module.get<CommunicationMessageResolver>(
			CommunicationMessageResolver,
		);

		jest.useFakeTimers({ now: fakeTime });
	});

	it('should create communication message', async () => {
		const user = {} as AuthUser;
		const sender = plainToInstance(UnitInput, {
			type: UnitInputType.UNKNOWN_UNIT,
			name: 'UU1',
		});
		const recipient = plainToInstance(UnitInput, {
			type: UnitInputType.REGISTERED_UNIT,
			id: '6662c123e48ee645ceb3ff5e',
		});
		const message = 'testmessage';
		const channel = 'T';

		const returnValue = {} as CommunicationMessage;
		mockCommandBus.execute.mockResolvedValueOnce(returnValue);

		const result = await resolver.createCommunicationMessage(
			user,
			sender,
			recipient,
			message,
			channel,
		);

		expect(mockCommandBus.execute).toHaveBeenCalledWith(
			expect.objectContaining({
				time: fakeTime,
				requestUser: user,
				sender: expect.objectContaining({ name: sender.name }),
				recipient: expect.objectContaining({ unit: { id: recipient.id } }),
				message,
				channel,
			}),
		);

		expect(result).toBe(returnValue);
	});
});
