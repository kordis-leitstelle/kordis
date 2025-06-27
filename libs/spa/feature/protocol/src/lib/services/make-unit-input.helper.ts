import { BaseCreateMessageInput, Unit, UnitInput } from '@kordis/shared/model';

import { ProtocolCommunicationDetailsFormGroup } from '../components/protocol-communication-details/protocol-communication-details.component';

export function makeUnitInput(unit: Unit | string): UnitInput {
	if (typeof unit === 'string') {
		return {
			type: 'UNKNOWN_UNIT',
			name: unit,
		};
	} else {
		return {
			type: 'REGISTERED_UNIT',
			id: unit.id,
		};
	}
}

export function getProtocolPayloadIfFormValid(
	formGroup: ProtocolCommunicationDetailsFormGroup,
): BaseCreateMessageInput | null {
	if (formGroup.invalid) {
		return null;
	}
	const protocolValue = formGroup.getRawValue();
	return {
		sender: makeUnitInput(protocolValue.sender),
		recipient: makeUnitInput(protocolValue.recipient),
		channel: protocolValue.channel,
	};
}
