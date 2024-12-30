export interface IEntitySearchEngine<Entity> {
	search(searchTerm: string): Entity[];
	setSearchableEntities(entities: Entity[]): void;
}

/*
 * A generic search engine for entities which is able to search through a list of entities that can change over time.
 */
export class EntitySearchEngine<Entity = unknown>
	implements IEntitySearchEngine<Entity>
{
	private searchableEntities: Entity[] = [];

	constructor(
		private readonly entityMatchStrategy: (
			entity: Entity,
			searchTerm: string,
		) => boolean,
	) {}

	setSearchableEntities(entities: Entity[]): void {
		this.searchableEntities = entities;
	}

	search(searchTerm: string): Entity[] {
		return this.searchableEntities.filter((entity) =>
			this.entityMatchStrategy(entity, searchTerm),
		);
	}
}
