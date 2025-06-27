import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Test, TestingModule } from '@nestjs/testing';

import { ProtocolEntryBaseDocument } from '../infra/schema/protocol-entry-base.schema';
import { ProtocolEntryType } from '../infra/schema/protocol-entry-type.enum';
import {
	DOCUMENT_CONSTRUCTORS,
	ENTITY_CONSTRUCTORS,
	ProtocolEntryMapper,
} from './protocol-entry.mapper';

describe('ProtocolEntryMapper', () => {
	let protocolEntryMapper: ProtocolEntryMapper;
	let mockMapper: Partial<Mapper>;

	beforeEach(async () => {
		// Create a mock mapper that returns instances of the target type
		mockMapper = {
			map: jest.fn().mockImplementation((source) => {
				// For mapDocumentToEntity, return an instance of the entity type
				if (source.type) {
					const entityConstructor = ENTITY_CONSTRUCTORS[
						source.type as ProtocolEntryType
					].entity as any;
					return new entityConstructor();
				}
				// For mapEntityToDocument, return an instance of the document type
				else {
					const documentConstructor = DOCUMENT_CONSTRUCTORS[
						source.constructor.name
					] as any;
					return new documentConstructor();
				}
			}),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProtocolEntryMapper,
				{
					provide: getMapperToken(),
					useValue: mockMapper,
				},
			],
		}).compile();

		protocolEntryMapper = module.get<ProtocolEntryMapper>(ProtocolEntryMapper);
	});

	describe('mapDocumentToEntity', () => {
		it('should throw error if document has an invalid type', () => {
			const doc: ProtocolEntryBaseDocument = {
				type: 'INVALID_TYPE' as any,
			} as any;

			expect(() => protocolEntryMapper.mapDocumentToEntity(doc)).toThrow();
		});

		// Test each entry in ENTITY_CONSTRUCTORS
		Object.entries(ENTITY_CONSTRUCTORS).forEach(([type, { entity }]) => {
			it(`should map ${type} document to entity`, () => {
				const doc: ProtocolEntryBaseDocument = {
					type: type as ProtocolEntryType,
					payload: {},
				} as any;

				const result = protocolEntryMapper.mapDocumentToEntity(doc);

				expect(result).toBeInstanceOf(entity as any);
			});
		});
	});

	describe('mapEntityToDocument', () => {
		// Test each entry in DOCUMENT_CONSTRUCTORS
		Object.entries(DOCUMENT_CONSTRUCTORS).forEach(
			([entityName, documentType]) => {
				it(`should map ${entityName} entity to document`, () => {
					// Find the entity constructor
					const entityConstructor = Object.values(ENTITY_CONSTRUCTORS).find(
						({ entity }) => (entity as any).name === entityName,
					)?.entity as any;

					if (!entityConstructor) {
						throw new Error(`Entity constructor not found for ${entityName}`);
					}

					// Create an instance of the entity
					const entity = new entityConstructor();

					// Map entity to document
					const result = protocolEntryMapper.mapEntityToDocument(entity);

					// Check that the result is an instance of the expected document type
					expect(result).toBeInstanceOf(documentType as any);
				});
			},
		);
	});
});
