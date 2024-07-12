import { TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';

import { GraphqlService } from '@kordis/spa/core/graphql';

import { EntitySearchService } from '../../../services/entity-search.service';
import { PossibleEntitySelectionsService } from './possible-entity-selection.service';

class TestEntitySelectionService extends PossibleEntitySelectionsService<
	{ id: string; name: string },
	{
		testEntities: { id: string; name: string }[];
	}
> {
	protected query = {} as any; // Mock GraphQL query
	protected queryName = 'testEntities' as const;
	protected searchService =
		createMock<EntitySearchService<{ id: string; name: string }>>(); // Mock search service
}

describe('PossibleEntitySelectionsService', () => {
	let service: PossibleEntitySelectionsService<
		{ id: string; name: string },
		{
			testEntities: { id: string; name: string }[];
		}
	>;
	let graphqlServiceMock: DeepMocked<GraphqlService>;

	beforeEach(() => {
		graphqlServiceMock = createMock<GraphqlService>();

		TestBed.configureTestingModule({
			providers: [
				TestEntitySelectionService,
				{ provide: GraphqlService, useValue: graphqlServiceMock },
			],
		});

		service = TestBed.inject(TestEntitySelectionService);
	});

	it('should mark and unmark an entity as selected', () => {
		const testEntity = { id: '1', name: 'Test Entity' };
		service.markAsSelected(testEntity);
		expect(service.isSelected(testEntity)).toBe(true);

		service.unmarkAsSelected(testEntity);
		expect(service.isSelected(testEntity)).toBe(false);
	});

	it('should filter out selected entities from all possible entities to select', () =>
		new Promise<void>((done) => {
			const testEntities = [
				{ id: '1', name: 'Entity 1' },
				{ id: '2', name: 'Entity 2' },
			];
			graphqlServiceMock.queryOnce$.mockReturnValue(of({ testEntities }));

			service.markAsSelected(testEntities[0]);

			service.allPossibleEntitiesToSelect$.subscribe((entities) => {
				expect(entities.length).toBe(1);
				expect(entities[0].id).toBe('2');
				done();
			});
		}));

	it('should filter search', async () => {
		service.markAsSelected({ id: '1', name: 'Entity 1' });
		(service as any).searchService.searchByTerm.mockResolvedValue([
			{ id: '1', name: 'Entity 1' },
			{ id: '2', name: 'Entity 2' },
		]);
		await expect(service.searchAllPossibilities('query')).resolves.toEqual([
			{ id: '2', name: 'Entity 2' },
		]);
	});
});
