import {
	RegisteredUnit,
	UnknownUnit,
} from '../../core/entity/partials/unit-partial.entity';
import { UnitInput, UnitInputType } from '../view-model/unit-input.view-model';
import { BaseCreateMessageArgs } from './base-create-message.args';

describe('BaseCreateMessageArgs', () => {
	it('should transform sender and receiver', async () => {
		const baseCreateMessageArgs = new BaseCreateMessageArgs();
		const senderUnitInput = new UnitInput();
		senderUnitInput.type = UnitInputType.UNKNOWN_UNIT;
		senderUnitInput.name = 'Name';
		baseCreateMessageArgs.sender = senderUnitInput;

		await expect(
			baseCreateMessageArgs.getTransformedSender(),
		).resolves.toBeInstanceOf(UnknownUnit);

		const receiverUnitInput = new UnitInput();
		receiverUnitInput.type = UnitInputType.REGISTERED_UNIT;
		receiverUnitInput.id = '66622000cd0f5780cf0c0046';
		baseCreateMessageArgs.recipient = receiverUnitInput;

		await expect(
			baseCreateMessageArgs.getTransformedRecipient(),
		).resolves.toBeInstanceOf(RegisteredUnit);
	});

	it('should return transformed payload', async () => {
		const baseCreateMessageArgs = new BaseCreateMessageArgs();
		baseCreateMessageArgs.channel = 'channel';
		const senderUnitInput = new UnitInput();
		senderUnitInput.type = UnitInputType.UNKNOWN_UNIT;
		senderUnitInput.name = 'Name';
		baseCreateMessageArgs.sender = senderUnitInput;
		const receiverUnitInput = new UnitInput();
		receiverUnitInput.type = UnitInputType.REGISTERED_UNIT;
		receiverUnitInput.id = '66622000cd0f5780cf0c0046';
		baseCreateMessageArgs.recipient = receiverUnitInput;

		await expect(baseCreateMessageArgs.asTransformedPayload()).resolves.toEqual(
			{
				sender: expect.any(UnknownUnit),
				recipient: expect.any(RegisteredUnit),
				channel: 'channel',
			},
		);
	});
});
