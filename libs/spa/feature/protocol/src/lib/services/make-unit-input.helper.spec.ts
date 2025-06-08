import { FormControl, FormGroup } from '@angular/forms';

import { Unit } from '@kordis/shared/model';

import { ProtocolCommunicationDetailsFormGroup } from '../components/protocol-communication-details/protocol-communication-details.component';
import {
	getProtocolPayloadIfFormValid,
	makeUnitInput,
} from './make-unit-input.helper';

describe('makeUnitInput', () => {
	it('should create UnitInput with type UNKNOWN_UNIT and name when input is a string', () => {
		const unitName = 'Test Unit';

		const result = makeUnitInput(unitName);

		expect(result).toEqual({
			type: 'UNKNOWN_UNIT',
			name: unitName,
		});
	});

	it('should create UnitInput with type REGISTERED_UNIT and id when input is a Unit object', () => {
		const unit: Unit = {
			id: '123',
			name: 'Test Unit',
			callSign: 'TU1',
			callSignAbbreviation: 'TU',
			department: 'Test Department',
			note: '',
			orgId: 'org1',
			rcsId: 'rcs1',
			createdAt: new Date().toISOString(),
			furtherAttributes: [],
		};

		const result = makeUnitInput(unit);

		expect(result).toEqual({
			type: 'REGISTERED_UNIT',
			id: unit.id,
		});
	});
});

describe('getProtocolPayloadIfFormValid', () => {
	it('should return null if form is invalid', () => {
		const formGroup = new FormGroup({
			sender: new FormControl<Unit | string | null>(null, {
				nonNullable: false,
			}),
			recipient: new FormControl<Unit | string>('', { nonNullable: false }),
			channel: new FormControl<string>('', { nonNullable: true }),
		}) as ProtocolCommunicationDetailsFormGroup;

		formGroup.controls.sender.setErrors({ required: true });

		const result = getProtocolPayloadIfFormValid(formGroup);

		expect(result).toBeNull();
	});

	it('should return BaseCreateMessageInput with correct values if form is valid', () => {
		const sender: Unit = {
			id: '123',
			name: 'Sender Unit',
			callSign: 'SU1',
			callSignAbbreviation: 'SU',
			department: 'Sender Department',
			note: '',
			orgId: 'org1',
			rcsId: 'rcs1',
			createdAt: new Date().toISOString(),
			furtherAttributes: [],
		};

		const recipient = 'Recipient Unit';
		const channel = 'Test Channel';

		const formGroup = new FormGroup({
			sender: new FormControl<Unit | string>(sender, { nonNullable: false }),
			recipient: new FormControl<Unit | string>(recipient, {
				nonNullable: false,
			}),
			channel: new FormControl<string>(channel, { nonNullable: true }),
		}) as ProtocolCommunicationDetailsFormGroup;

		const result = getProtocolPayloadIfFormValid(formGroup);

		expect(result).toEqual({
			sender: {
				type: 'REGISTERED_UNIT',
				id: sender.id,
			},
			recipient: {
				type: 'UNKNOWN_UNIT',
				name: recipient,
			},
			channel,
		});
	});
});
