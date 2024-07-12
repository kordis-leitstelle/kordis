import { TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TypedDocumentNode } from 'apollo-angular';
import { of } from 'rxjs';

import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { AbstractEntitySearchService } from './entity-search.service';

interface TestEntity {
	id: string;
	name: string;
	someMoreData: string;
}

type QueryAllResponse = {
	testEntities: TestEntity[];
};

type QueryOneResponse = {
	testEntity: TestEntity;
};

const getAllQuery: TypedDocumentNode<QueryAllResponse> = gql`
	query GetAllTestEntities {
		testEntities {
			id
			name
		}
	}
`;

const getOneQuery: TypedDocumentNode<QueryOneResponse> = gql`
	query GetTestEntity($id: String!) {
		testEntity(id: $id) {
			id
			name
			someMoreData
		}
	}
`;

class TestEntitySearchService extends AbstractEntitySearchService<
	TestEntity,
	QueryAllResponse,
	QueryOneResponse
> {
	constructor() {
		super(getAllQuery, getOneQuery, 'testEntities', 'testEntity', ['name']);
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
	let graphqlServiceMock: DeepMocked<GraphqlService>;

	beforeEach(() => {
		graphqlServiceMock = createMock<GraphqlService>();
		graphqlServiceMock.queryOnce$.mockReturnValueOnce(
			of({
				testEntities: [
					{ id: '1', name: 'Entity One' },
					{ id: '2', name: 'Entity Two' },
				],
			}),
		);

		TestBed.configureTestingModule({
			providers: [
				{ provide: GraphqlService, useValue: graphqlServiceMock },
				TestEntitySearchService,
			],
		});

		service = TestBed.inject(TestEntitySearchService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should fetch all entities initially', () => {
		expect(graphqlServiceMock.queryOnce$).toHaveBeenCalledWith(getAllQuery);
		expect(searchEngineAddAllMock).toHaveBeenCalledWith([
			{ id: '1', name: 'Entity One' },
			{ id: '2', name: 'Entity Two' },
		]);
	});

	it('should populate entities correctly on search by term', async () => {
		searchEngineSearchMock.mockReturnValueOnce([
			{ id: '1', name: 'Entity One' },
		]);
		graphqlServiceMock.queryOnce$.mockReturnValueOnce(
			of({
				testEntity: {
					id: '1',
					name: 'Entity One',
					someMoreData: 'Some more data',
				},
			}),
		);
		const entities = await service.searchByTerm('One');
		expect(entities).toEqual([
			{ id: '1', name: 'Entity One', someMoreData: 'Some more data' },
		]);
	});
});
