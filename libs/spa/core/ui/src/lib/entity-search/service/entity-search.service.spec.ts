import { EntitySearchEngine } from './entity-search.service';

describe('EntitySearchEngine', () => {
	let searchEngine: EntitySearchEngine<{ id: string; name: string }>;
	const mockMatchStrategy = jest.fn((entity, searchTerm) =>
		entity.name.includes(searchTerm),
	);

	beforeEach(() => {
		searchEngine = new EntitySearchEngine(mockMatchStrategy);
	});

	it('should set searchable entities', () => {
		const entities = [
			{ id: '1', name: 'Entity One' },
			{ id: '2', name: 'Entity Two' },
		];
		searchEngine.setSearchableEntities(entities);
		expect(searchEngine['searchableEntities']).toEqual(entities);
	});

	it('should search entities based on the match strategy', () => {
		const entities = [
			{ id: '1', name: 'Entity One' },
			{ id: '2', name: 'Entity Two' },
			{ id: '3', name: 'Another' },
		];
		searchEngine.setSearchableEntities(entities);

		const result = searchEngine.search('Entity');
		expect(result).toEqual([
			{ id: '1', name: 'Entity One' },
			{ id: '2', name: 'Entity Two' },
		]);
	});

	it('should return an empty array if no entities match the search term', () => {
		const entities = [
			{ id: '1', name: 'Entity One' },
			{ id: '2', name: 'Entity Two' },
		];
		searchEngine.setSearchableEntities(entities);

		const result = searchEngine.search('Nonexistent');
		expect(result).toEqual([]);
	});
});
