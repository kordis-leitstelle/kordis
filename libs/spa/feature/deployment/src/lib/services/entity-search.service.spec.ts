import { TestBed } from '@angular/core/testing';

import { AbstractEntitySearchService } from './entity-search.service';

interface TestEntity {
	id: string;
	name: string;
	someMoreData: string;
}

const TEST_ENTITY_PROVIDER = {
	provideByIds: jest.fn(),
	provideInitial: jest.fn().mockResolvedValue([
		{ id: '1', name: 'Entity One' },
		{ id: '2', name: 'Entity Two' },
	]),
};

class TestEntitySearchService extends AbstractEntitySearchService<TestEntity> {
	constructor() {
		super(TEST_ENTITY_PROVIDER, ['name']);
	}
}

const searchEngineAddAllMock = jest.fn();
const searchEngineSearchMock = jest.fn();
jest.mock('minisearch', () =>
	jest.fn().mockImplementation(() => ({
		addAll: searchEngineAddAllMock,
		search: searchEngineSearchMock,
	})),
);

describe('TestEntitySearchService', () => {
	let service: TestEntitySearchService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [TestEntitySearchService],
		});

		service = TestBed.inject(TestEntitySearchService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should fetch all entities initially', () => {
		expect(TEST_ENTITY_PROVIDER.provideInitial).toHaveBeenCalled();
		expect(searchEngineAddAllMock).toHaveBeenCalledWith([
			{ id: '1', name: 'Entity One' },
			{ id: '2', name: 'Entity Two' },
		]);
	});

	it('should populate entities correctly on search by term', async () => {
		searchEngineSearchMock.mockReturnValueOnce([
			{ id: '1', name: 'Entity One' },
		]);
		TEST_ENTITY_PROVIDER.provideByIds.mockResolvedValueOnce([
			{ id: '1', name: 'Entity One', someMoreData: 'Some more data' },
		]);
		const entities = await service.searchByTerm('One');
		expect(TEST_ENTITY_PROVIDER.provideByIds).toHaveBeenCalledWith(['1']);
		expect(entities).toEqual([
			{ id: '1', name: 'Entity One', someMoreData: 'Some more data' },
		]);
	});
});
