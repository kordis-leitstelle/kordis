import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';

import { BaseModelProfile } from '@kordis/api/shared';

import { UserProducer } from '../core/entity/partials/producer-partial.entity';
import {
	RegisteredUnit,
	UnknownUnit,
} from '../core/entity/partials/unit-partial.entity';
import {
	CommunicationMessage,
	CommunicationMessagePayload,
} from '../core/entity/protocol-entries/communication-message.entity';
import { ProtocolEntryBase } from '../core/entity/protocol-entries/protocol-entry-base.entity';
import {
	RescueStationMessageAssignedAlertGroup,
	RescueStationMessageAssignedUnit,
	RescueStationMessagePayload,
	RescueStationMessageStrength,
} from '../core/entity/protocol-entries/rescue-station/rescue-station-message-payload.entity';
import { RescueStationSignOffMessage } from '../core/entity/protocol-entries/rescue-station/rescue-station-sign-off-message.entity';
import { RescueStationSignOnMessage } from '../core/entity/protocol-entries/rescue-station/rescue-station-sign-on-message.entity';
import { RescueStationUpdateMessage } from '../core/entity/protocol-entries/rescue-station/rescue-station-update-message.entity';
import {
	CommunicationMessageDocument,
	CommunicationMessagePayloadDocument,
} from '../infra/schema/communication/communication-message.schema';
import { UserProducerDocument } from '../infra/schema/producer-partial.schema';
import { ProtocolEntryBaseDocument } from '../infra/schema/protocol-entry-base.schema';
import {
	RescueStationMessageAssignedAlertGroupDocument,
	RescueStationMessageAssignedUnitDocument,
	RescueStationMessagePayloadDocument,
	RescueStationMessageStrengthDocument,
} from '../infra/schema/rescue-station/rescue-station-message-payload.schema';
import { RescueStationSignOnMessageDocument } from '../infra/schema/rescue-station/rescue-station-sign-on-message.schema';
import { RescueStationUpdateMessageDocument } from '../infra/schema/rescue-station/rescue-station-updated-message.schema';
import {
	RegisteredUnitDocument,
	UnknownUnitDocument,
} from '../infra/schema/unit-partial.schema';
import { ProducerPartialProfile } from './producer-partial.mapper-profile';
import {
	CommunicationMessageDocumentProfile,
	CommunicationMessagePayloadDocumentProfile,
} from './protocol-document.mapper-profile';
import {
	CommunicationMessagePayloadProfile,
	CommunicationMessageProfile,
} from './protocol-entity.mapper-profile';
import { ProtocolEntryMapper } from './protocol-entry.mapper';
import { RescueStationMessagePayloadDocumentProfile } from './rescue-station/rescue-station-message-payload-document.mapper-profile';
import { RescueStationMessagePayloadProfile } from './rescue-station/rescue-station-message-payload-entity.mapper-profile';
import {
	RescueStationSignOffMessageDocumentProfile,
	RescueStationSignOffMessagePayloadDocumentProfile,
} from './rescue-station/rescue-station-sign-off-message-document.mapper-profile';
import {
	RescueStationSignOffMessageEntityProfile,
	RescueStationSignOffMessagePayloadEntityProfile,
} from './rescue-station/rescue-station-sign-off-message-entity.mapper-profile';
import { RescueStationSignOnMessageDocumentProfile } from './rescue-station/rescue-station-sign-on-message-document.mapper-profile';
import { RescueStationSignOnMessageEntityProfile } from './rescue-station/rescue-station-sign-on-message-entity.mapper-profile';
import { RescueStationUpdateMessageDocumentProfile } from './rescue-station/rescue-station-update-message-document.mapper-profile';
import { RescueStationUpdateMessageEntityProfile } from './rescue-station/rescue-station-update-message-entity.mapper-profile';
import { UnitPartialProfile } from './unit-partial.mapper-profile';

const fakeTime = new Date('1953-04-13');

const testCases: {
	entityName: string;
	entity: ProtocolEntryBase;
	documentName: string;
	document: ProtocolEntryBaseDocument;
}[] = [
	{
		entityName: CommunicationMessage.name,
		entity: plainToInstance(CommunicationMessage, {
			payload: plainToInstance(CommunicationMessagePayload, {
				message:
					'one medium dry vodka martini mixed like you said, sir, but not stirred.',
			}),
			sender: plainToInstance(UnknownUnit, { name: 'James Bond' }),
			recipient: plainToInstance(RegisteredUnit, {
				unit: { id: '6662c25962bc301aac2cbcd6' },
			}),
			channel: 'Walter',
			producer: plainToInstance(UserProducer, {
				userId: '007',
				firstName: 'James',
				lastName: 'Bond',
			}),
			searchableText:
				'one medium dry vodka martini mixed like you said, sir, but not stirred.',
			time: new Date('1956-03-26'),
			orgId: 'orgId-123',
			createdAt: undefined,
			updatedAt: undefined,
		}),
		documentName: CommunicationMessageDocument.name,
		document: plainToInstance(CommunicationMessageDocument, {
			type: 'COMMUNICATION_MESSAGE_ENTRY',
			payload: plainToInstance(CommunicationMessagePayloadDocument, {
				message:
					'one medium dry vodka martini mixed like you said, sir, but not stirred.',
			}),
			sender: plainToInstance(UnknownUnitDocument, {
				name: 'James Bond',
				type: 'UNKNOWN_UNIT',
			}),
			recipient: plainToInstance(RegisteredUnitDocument, {
				type: 'REGISTERED_UNIT',
				unitId: '6662c25962bc301aac2cbcd6',
			}),
			channel: 'Walter',
			producer: plainToInstance(UserProducerDocument, {
				type: 'USER_PRODUCER',
				userId: '007',
				firstName: 'James',
				lastName: 'Bond',
			}),
			searchableText:
				'one medium dry vodka martini mixed like you said, sir, but not stirred.',
			time: new Date('1956-03-26'),
			orgId: 'orgId-123',
			createdAt: undefined,
			updatedAt: undefined,
		}),
	},
	{
		entityName: RescueStationSignOnMessage.name,
		entity: plainToInstance(RescueStationSignOnMessage, {
			producer: plainToInstance(UserProducer, {
				userId: '007',
				firstName: 'James',
				lastName: 'Bond',
			}),
			sender: plainToInstance(UnknownUnit, { name: 'James Bond' }),
			recipient: plainToInstance(RegisteredUnit, {
				unit: { id: '6662c25962bc301aac2cbcd6' },
			}),
			payload: plainToInstance(RescueStationMessagePayload, {
				rescueStationId: '6662c25962bc301aac2cbcd6',
				rescueStationName: 'MI6',
				rescueStationCallSign: 'MI6',
				strength: plainToInstance(RescueStationMessageStrength, {
					helpers: 3,
					subLeaders: 2,
					leaders: 1,
				}),
				units: [
					plainToInstance(RescueStationMessageAssignedUnit, {
						id: '6662c25962bc301aac2cb007',
						name: 'James Bond',
						callSign: '007',
					}),
				],
				alertGroups: [
					plainToInstance(RescueStationMessageAssignedAlertGroup, {
						id: '6662c25962bc301aac2cbcde2',
						name: 'James Bond Alliance',
						units: [
							plainToInstance(RescueStationMessageAssignedUnit, {
								id: '6662c25962bc301aac2c008',
								name: 'James Bond Jr.',
								callSign: '008',
							}),
						],
					}),
				],
			}),
			searchableText:
				'one medium dry vodka martini mixed like you said, sir, but not stirred.',
			channel: 'Walter',
			orgId: 'orgId-123',
			createdAt: undefined,
			updatedAt: undefined,
		}),
		documentName: RescueStationSignOnMessageDocument.name,
		document: plainToInstance(RescueStationSignOnMessageDocument, {
			type: 'RESCUE_STATION_SIGN_ON_ENTRY',
			producer: plainToInstance(UserProducerDocument, {
				type: 'USER_PRODUCER',
				userId: '007',
				firstName: 'James',
				lastName: 'Bond',
			}),
			payload: plainToInstance(RescueStationMessagePayloadDocument, {
				rescueStationId: '6662c25962bc301aac2cbcd6',
				rescueStationName: 'MI6',
				rescueStationCallSign: 'MI6',
				strength: plainToInstance(RescueStationMessageStrengthDocument, {
					helpers: 3,
					subLeaders: 2,
					leaders: 1,
				}),
				units: [
					plainToInstance(RescueStationMessageAssignedUnitDocument, {
						id: '6662c25962bc301aac2cb007',
						name: 'James Bond',
						callSign: '007',
					}),
				],
				alertGroups: [
					plainToInstance(RescueStationMessageAssignedAlertGroupDocument, {
						id: '6662c25962bc301aac2cbcde2',
						name: 'James Bond Alliance',
						units: [
							plainToInstance(RescueStationMessageAssignedUnitDocument, {
								id: '6662c25962bc301aac2c008',
								name: 'James Bond Jr.',
								callSign: '008',
							}),
						],
					}),
				],
			}),
			searchableText:
				'one medium dry vodka martini mixed like you said, sir, but not stirred.',
			sender: plainToInstance(UnknownUnitDocument, {
				name: 'James Bond',
				type: 'UNKNOWN_UNIT',
			}),
			recipient: plainToInstance(RegisteredUnitDocument, {
				type: 'REGISTERED_UNIT',
				unitId: '6662c25962bc301aac2cbcd6',
			}),
			channel: 'Walter',
			orgId: 'orgId-123',
			createdAt: undefined,
			updatedAt: undefined,
		}),
	},
	{
		entityName: RescueStationUpdateMessage.name,
		entity: plainToInstance(RescueStationUpdateMessage, {
			producer: plainToInstance(UserProducer, {
				userId: '007',
				firstName: 'James',
				lastName: 'Bond',
			}),
			sender: plainToInstance(UnknownUnit, { name: 'James Bond' }),
			recipient: plainToInstance(RegisteredUnit, {
				unit: { id: '6662c25962bc301aac2cbcd6' },
			}),
			payload: plainToInstance(RescueStationMessagePayload, {
				rescueStationId: '6662c25962bc301aac2cbcd6',
				rescueStationName: 'MI6',
				rescueStationCallSign: 'MI6',
				strength: plainToInstance(RescueStationMessageStrength, {
					helpers: 3,
					subLeaders: 2,
					leaders: 1,
				}),
				units: [
					plainToInstance(RescueStationMessageAssignedUnit, {
						id: '6662c25962bc301aac2cb007',
						name: 'James Bond',
						callSign: '007',
					}),
				],
				alertGroups: [
					plainToInstance(RescueStationMessageAssignedAlertGroup, {
						id: '6662c25962bc301aac2cbcde2',
						name: 'James Bond Alliance',
						units: [
							plainToInstance(RescueStationMessageAssignedUnit, {
								id: '6662c25962bc301aac2c008',
								name: 'James Bond Jr.',
								callSign: '008',
							}),
						],
					}),
				],
			}),
			searchableText:
				'one medium dry vodka martini mixed like you said, sir, but not stirred.',
			channel: 'Walter',
			orgId: 'orgId-123',
			createdAt: undefined,
			updatedAt: undefined,
		}),
		documentName: RescueStationUpdateMessageDocument.name,
		document: plainToInstance(RescueStationUpdateMessageDocument, {
			type: 'RESCUE_STATION_UPDATE_ENTRY',
			producer: plainToInstance(UserProducerDocument, {
				type: 'USER_PRODUCER',
				userId: '007',
				firstName: 'James',
				lastName: 'Bond',
			}),
			payload: plainToInstance(RescueStationMessagePayloadDocument, {
				rescueStationId: '6662c25962bc301aac2cbcd6',
				rescueStationName: 'MI6',
				rescueStationCallSign: 'MI6',
				strength: plainToInstance(RescueStationMessageStrengthDocument, {
					helpers: 3,
					subLeaders: 2,
					leaders: 1,
				}),
				units: [
					plainToInstance(RescueStationMessageAssignedUnitDocument, {
						id: '6662c25962bc301aac2cb007',
						name: 'James Bond',
						callSign: '007',
					}),
				],
				alertGroups: [
					plainToInstance(RescueStationMessageAssignedAlertGroupDocument, {
						id: '6662c25962bc301aac2cbcde2',
						name: 'James Bond Alliance',
						units: [
							plainToInstance(RescueStationMessageAssignedUnitDocument, {
								id: '6662c25962bc301aac2c008',
								name: 'James Bond Jr.',
								callSign: '008',
							}),
						],
					}),
				],
			}),
			searchableText:
				'one medium dry vodka martini mixed like you said, sir, but not stirred.',
			sender: plainToInstance(UnknownUnitDocument, {
				name: 'James Bond',
				type: 'UNKNOWN_UNIT',
			}),
			recipient: plainToInstance(RegisteredUnitDocument, {
				type: 'REGISTERED_UNIT',
				unitId: '6662c25962bc301aac2cbcd6',
			}),
			channel: 'Walter',
			orgId: 'orgId-123',
			createdAt: undefined,
			updatedAt: undefined,
		}),
	},
	{
		entityName: RescueStationSignOffMessage.name,
		entity: plainToInstance(RescueStationSignOffMessage, {
			producer: plainToInstance(UserProducer, {
				userId: '007',
				firstName: 'James',
				lastName: 'Bond',
			}),
			sender: plainToInstance(UnknownUnit, { name: 'James Bond' }),
			recipient: plainToInstance(RegisteredUnit, {
				unit: { id: '6662c25962bc301aac2cbcd6' },
			}),
			payload: plainToInstance(RescueStationMessagePayload, {
				rescueStationId: '6662c25962bc301aac2cbcd6',
				rescueStationName: 'MI6',
				rescueStationCallSign: 'MI6',
			}),
			searchableText:
				'one medium dry vodka martini mixed like you said, sir, but not stirred.',
			channel: 'Walter',
			orgId: 'orgId-123',
			createdAt: undefined,
			updatedAt: undefined,
		}),
		documentName: RescueStationUpdateMessageDocument.name,
		document: plainToInstance(RescueStationUpdateMessageDocument, {
			type: 'RESCUE_STATION_SIGN_OFF_ENTRY',
			producer: plainToInstance(UserProducerDocument, {
				type: 'USER_PRODUCER',
				userId: '007',
				firstName: 'James',
				lastName: 'Bond',
			}),
			payload: plainToInstance(RescueStationMessagePayloadDocument, {
				rescueStationId: '6662c25962bc301aac2cbcd6',
				rescueStationName: 'MI6',
				rescueStationCallSign: 'MI6',
			}),
			searchableText:
				'one medium dry vodka martini mixed like you said, sir, but not stirred.',
			sender: plainToInstance(UnknownUnitDocument, {
				name: 'James Bond',
				type: 'UNKNOWN_UNIT',
			}),
			recipient: plainToInstance(RegisteredUnitDocument, {
				type: 'REGISTERED_UNIT',
				unitId: '6662c25962bc301aac2cbcd6',
			}),
			channel: 'Walter',
			orgId: 'orgId-123',
			createdAt: undefined,
			updatedAt: undefined,
		}),
	},
];

describe('ProtocolEntryMapper - Test all protocol entry mappings', () => {
	let mapper: ProtocolEntryMapper;

	beforeAll(() => {
		jest.useFakeTimers({ now: fakeTime });
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				BaseModelProfile,
				CommunicationMessageDocumentProfile,
				CommunicationMessagePayloadDocumentProfile,
				CommunicationMessagePayloadProfile,
				CommunicationMessageProfile,
				ProducerPartialProfile,
				ProtocolEntryMapper,
				RescueStationMessagePayloadDocumentProfile,
				RescueStationMessagePayloadProfile,
				RescueStationSignOffMessageDocumentProfile,
				RescueStationSignOffMessageDocumentProfile,
				RescueStationSignOffMessageEntityProfile,
				RescueStationSignOffMessagePayloadEntityProfile,
				RescueStationSignOffMessagePayloadDocumentProfile,
				RescueStationSignOnMessageDocumentProfile,
				RescueStationSignOnMessageEntityProfile,
				RescueStationUpdateMessageDocumentProfile,
				RescueStationUpdateMessageEntityProfile,
				UnitPartialProfile,
			],
		}).compile();

		mapper = module.get<ProtocolEntryMapper>(ProtocolEntryMapper);
	});

	test.each(testCases)(
		'Should map entity $entityName to document $documentName',
		async ({ entity, document }) => {
			const result = await mapper.map(entity);

			expect(result).toEqual(document);
		},
	);

	test.each(testCases)(
		'Should map document $documentName to entity $entityName',
		async ({ entity, document }) => {
			const result = await mapper.map(document);

			expect(result).toEqual(entity);
		},
	);

	it('Should error for unknown child classes of ProtocolEntryBase', () => {
		class UnknownProtocolEntryClass extends ProtocolEntryBase {}

		const unknownClassInstance = plainToInstance(UnknownProtocolEntryClass, {});

		expect(() => mapper.map(unknownClassInstance)).toThrow();
	});

	it('Should error for unknown child classes of ProtocolEntryBaseDocument', () => {
		class UnknwonProtocolEntryDocumentClass extends ProtocolEntryBaseDocument {}

		const unknownClassInstance = plainToInstance(
			UnknwonProtocolEntryDocumentClass,
			{},
		);

		expect(() => mapper.map(unknownClassInstance)).toThrow();
	});
});
