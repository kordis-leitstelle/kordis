import { RegisteredUnit, UnknownUnit } from '@kordis/shared/model';

import { BaseCreateMessageArgs } from './infra/controller/base-create-message.args';
import {
	UnitInput,
	UnitInputType,
} from './infra/view-model/unit-input.view-model';

const MOCK_BASE_CREATE_MESSAGE_ARGS = new BaseCreateMessageArgs();
MOCK_BASE_CREATE_MESSAGE_ARGS.channel = 'channel';
const senderUnitInput = new UnitInput();
senderUnitInput.type = UnitInputType.UNKNOWN_UNIT;
senderUnitInput.name = 'Name';
MOCK_BASE_CREATE_MESSAGE_ARGS.sender = senderUnitInput;
const receiverUnitInput = new UnitInput();
receiverUnitInput.type = UnitInputType.REGISTERED_UNIT;
receiverUnitInput.id = '66622000cd0f5780cf0c0046';
MOCK_BASE_CREATE_MESSAGE_ARGS.recipient = receiverUnitInput;

export { MOCK_BASE_CREATE_MESSAGE_ARGS };

export const TRANSFORMED_MOCK_BASE_CREATE_MESSAGE_ARGS = Object.freeze({
	sender: { name: 'Name' } as UnknownUnit,
	recipient: { unit: { id: '66622000cd0f5780cf0c0046' } } as RegisteredUnit,
	channel: 'channel',
});
