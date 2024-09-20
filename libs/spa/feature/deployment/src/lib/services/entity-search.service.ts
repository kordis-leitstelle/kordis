import MiniSearch from 'minisearch';

/*
 * This provider is used to provide the entities that should be searchable.
 * provideInitial is used to provide the initial entities that should be indexed. It returns the necessary properties to search.
 * provideByIds is used to provide the entities by their ids. It returns the complete entity.
 */
export interface SearchEntityProvider<
	TEntity extends {
		id: string;
	},
> {
	provideByIds(ids: string[]): Promise<TEntity[]>;

	provideInitial(): Promise<Partial<TEntity>[]>;
}

export interface EntitySearchService<TEntity> {
	searchByTerm(query: string): Promise<TEntity[]>;
}

/*
 * This service is used to search for entities by a search term.
 * It indexes the entities and provides a search method to search for entities by a search term.
 */
export abstract class AbstractEntitySearchService<
	TEntity extends {
		id: string;
	},
> implements EntitySearchService<TEntity>
{
	protected readonly searchEngine: MiniSearch;

	protected constructor(
		private readonly entityProvider: SearchEntityProvider<TEntity>,
		searchFields: (keyof TEntity)[],
	) {
		this.searchEngine = new MiniSearch({
			fields: searchFields as string[],
		});
		// first index all entities with the necessary data to search
		this.indexInitialEntitiesAsync();
	}

	searchByTerm(query: string): Promise<TEntity[]> {
		const res = this.searchEngine.search(query, {
			prefix: true,
			combineWith: 'AND',
		});

		// populate the entities to get the whole entity
		return this.entityProvider.provideByIds(res.map((r) => r.id));
	}

	private indexInitialEntitiesAsync(): void {
		this.entityProvider
			.provideInitial()
			.then((entities) => this.searchEngine.addAll(entities));
	}
}
