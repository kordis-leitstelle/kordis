import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { mockModelMethodResult } from '@kordis/api/test-helpers';

import { ProtocolEntryBase } from '../../core/entity/protocol-entries/protocol-entry-base.entity';
import { ProtocolEntryMapper } from '../../mapper-profile/protocol-entry.mapper';
import { ProtocolEntryBaseDocument } from '../schema/protocol-entry-base.schema';
import { ImplProtocolEntryRepository } from './protocol-entry.repository';

describe('ProtocolEntryRepositoryImpl', () => {
	let repository: ImplProtocolEntryRepository;
	let protocolEntryModel: Model<ProtocolEntryBaseDocument>;
	const mapper = createMock<ProtocolEntryMapper>();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				AutomapperModule.forRoot({
					strategyInitializer: classes(),
				}),
			],
			providers: [
				{ provide: ProtocolEntryMapper, useValue: mapper },
				ImplProtocolEntryRepository,
				{
					provide: getModelToken(ProtocolEntryBaseDocument.name),
					useValue: createMock<Model<ProtocolEntryBaseDocument>>(),
				},
			],
		}).compile();

		repository = module.get<ImplProtocolEntryRepository>(
			ImplProtocolEntryRepository,
		);
		protocolEntryModel = module.get<Model<ProtocolEntryBaseDocument>>(
			getModelToken(ProtocolEntryBaseDocument.name),
		);
	});

	it('should create a protocol entry', async () => {
		mapper.map.mockReturnValue({} as any);

		const modelSpy = mockModelMethodResult(
			protocolEntryModel,
			{} as ProtocolEntryBaseDocument,
			'create',
		);

		const result = await repository.create({} as ProtocolEntryBase);

		expect(modelSpy).toHaveBeenCalled();
		expect(result).toEqual({});
	});

	it('should get count of protocol entries', async () => {
		const documentCountFunction = jest.fn().mockResolvedValue(42);

		const repositoryQueryMock = jest
			.spyOn(protocolEntryModel, 'find')
			.mockReturnValue({ countDocuments: documentCountFunction } as any);

		const result = await repository.getProtocolEntryCount('org-id');

		expect(result).toBe(42);
		expect(repositoryQueryMock).toHaveBeenCalledWith({ orgId: 'org-id' });
		expect(documentCountFunction).toHaveBeenCalled();
	});

	it('should get protocol entries', async () => {
		const queryMockFn = {
			find: jest.fn().mockReturnThis(),
			sort: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			lean: jest.fn().mockReturnThis(),
			exec: jest.fn().mockResolvedValue([{}, {}]),
		};
		jest.spyOn(protocolEntryModel, 'find').mockReturnValue(queryMockFn as any);
		mapper.map.mockReturnValue({} as any);

		const result = await repository.getProtocolEntries(
			'org-id',
			42,
			'preceding',
			new Date(),
		);

		expect(result).toHaveLength(2);
		expect(queryMockFn.sort).toHaveBeenCalled();
		expect(queryMockFn.limit).toHaveBeenCalled();
		expect(queryMockFn.find).toHaveBeenCalled();
		expect(queryMockFn.lean).toHaveBeenCalled();
		expect(queryMockFn.exec).toHaveBeenCalled();
	});

	it('should return whether there are more protocol entries', async () => {
		const queryMockFn = {
			select: jest.fn().mockReturnThis(),
			find: jest.fn().mockReturnThis(),
			sort: jest.fn().mockReturnThis(),
			findOne: jest.fn().mockResolvedValue({} as ProtocolEntryBase),
		};
		jest.spyOn(protocolEntryModel, 'find').mockReturnValue(queryMockFn as any);

		const result = await repository.hasProtocolEntries(
			'org-id',
			'preceding',
			new Date(),
		);

		expect(result).toBe(true);
		expect(queryMockFn.sort).toHaveBeenCalled();
		expect(queryMockFn.find).toHaveBeenCalled();
		expect(queryMockFn.findOne).toHaveBeenCalled();
	});

	it('should return protocol entries for given unit times', async () => {
		const organizationId = 'orgId';
		const units = [
			{
				unitId: 'unit1',
				range: {
					start: new Date('2023-01-01T00:00:00Z'),
					end: new Date('2023-01-01T01:00:00Z'),
				},
			},
			{
				unitId: 'unit2',
				range: { start: new Date('2023-01-02T00:00:00Z'), end: null },
			},
		];

		await repository.getFromUnitTimes(organizationId, units);

		expect(protocolEntryModel.find).toHaveBeenCalledWith({
			orgId: organizationId,
			$or: [
				{
					'sender.unitId': 'unit1',
					time: {
						$gte: new Date('2023-01-01T00:00:00Z'),
						$lte: new Date('2023-01-01T01:00:00Z'),
					},
				},
				{
					'sender.unitId': 'unit2',
					time: { $gte: new Date('2023-01-02T00:00:00Z') },
				},
			],
		});
	});
});
