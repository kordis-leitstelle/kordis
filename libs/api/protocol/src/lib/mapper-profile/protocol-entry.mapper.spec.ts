import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { before } from 'node:test';

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
    CommunicationMessageDocument,
    CommunicationMessagePayloadDocument,
} from '../infra/schema/communication-message.schema';
import { UserProducerDocument } from '../infra/schema/producer-partial.schema';
import { ProtocolEntryBaseDocument } from '../infra/schema/protocol-entry-base.schema';
import {
    RegisteredUnitDocument,
    UnknownUnitDocument,
} from '../infra/schema/unit-partial.schema';
import { ProducerPartialProfile } from './producer-partial.mapper-profile';
import { ProtocolEntryMapper } from './protocol-entry.mapper';
import { CommunicationMessageProfile } from './protocol.mapper-profile';
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
			orgId: undefined,
		}),
	},
];

describe('ProtocolEntryMapper - Test all protocol entry mappings', () => {
	let mapper: ProtocolEntryMapper;

	before(() => {
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
				ProducerPartialProfile,
				UnitPartialProfile,
				CommunicationMessageProfile,
				ProtocolEntryMapper,
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
			const result = await mapper.map(entity);

			expect(result).toEqual(document);
		},
	);

	it('Should error for unknown child classes of ProtocolEntryBase', () => {
		class UnknwonProtocolEntryClass extends ProtocolEntryBase {}

		const unknownClassInstance = plainToInstance(UnknwonProtocolEntryClass, {});

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
