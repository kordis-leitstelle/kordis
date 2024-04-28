// contains the status codes, that can be stored on a unit

export const ALLOWED_PERSISTENT_UNIT_STATUS = [1, 2, 3, 4, 6, 7, 8, 9];
export type PersistentUnitStatus =
	(typeof ALLOWED_PERSISTENT_UNIT_STATUS)[number];
