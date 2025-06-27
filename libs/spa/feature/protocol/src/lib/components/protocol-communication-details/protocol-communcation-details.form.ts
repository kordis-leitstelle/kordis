import { NonNullableFormBuilder, Validators } from '@angular/forms';

import { Unit } from '@kordis/shared/model';

import { DEFAULT_CHANNEL } from '../../channels';
import { ProtocolCommunicationDetailsFormGroup } from './protocol-communication-details.component';

export function makeProtocolCommunicationDetailsForm(
	fb: NonNullableFormBuilder,
): ProtocolCommunicationDetailsFormGroup {
	return fb.group(
		{
			sender: fb.control<Unit | string>('', Validators.required),
			recipient: fb.control<Unit | string>('', Validators.required),
			channel: fb.control<string>(DEFAULT_CHANNEL),
		},
		{
			validators: (formGroup) => {
				const sender = formGroup.get('sender')?.value;
				const recipient = formGroup.get('recipient')?.value;
				if ((!!sender && !recipient) || (!sender && !!recipient)) {
					return {
						protocolNotComplete: true,
					};
				}
				return null;
			},
		},
	);
}
