import { UnitEntity, UnitStatus } from '../entity/unit.entity';

export const UNIT_REPOSITORY = Symbol('UNIT_REPOSITORY');

export interface UnitRepository {
	findByIds(ids: string[]): Promise<UnitEntity[]>;

	findById(orgId: string, id: string): Promise<UnitEntity>;

	findByOrg(orgId: string): Promise<UnitEntity[]>;

	findByRcsId(orgId: string, rcsId: string): Promise<UnitEntity>;

	updateNote(orgId: string, id: string, note: string): Promise<boolean>;

	updateStatus(orgId: string, id: string, status: UnitStatus): Promise<boolean>;
}
