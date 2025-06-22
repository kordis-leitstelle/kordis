import { DbSessionProvider } from '@kordis/api/shared';

export const OPERATION_INVOLVEMENT_REPOSITORY = Symbol(
	'OPERATION_INVOLVEMENT_REPOSITORY',
);

export interface CreateUnitInvolvementDto {
	orgId: string;
	unitId: string;
	operationId: string;
	alertGroupId: string | null;
	involvementTimes: {
		start: Date;
		end: Date | null;
	}[];
	isPending: boolean;
}

export interface UnitInvolvement {
	unitId: string;
	operationId: string;
	involvementTimes: { start: Date; end: Date | null }[];
	alertGroupId: string | null;
	isPending: boolean;
}

export interface OperationInvolvementsRepository {
	/**
	 * Removes all involvements for a given operation.
	 * @param orgId The organization ID.
	 * @param operationId The operation ID.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	removeInvolvements(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<void>;

	/**
	 * Removes a specific involvement of a unit in an operation.
	 * @param orgId The organization ID.
	 * @param operationId The operation ID.
	 * @param unitId The unit ID.
	 * @param alertGroupId The alert group ID, if the unit is part of an alert group.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	removeInvolvement(
		orgId: string,
		unitId: string,
		alertGroupId: string | null,
		operationId: string,
		uow?: DbSessionProvider | undefined,
	): Promise<void>;

	/**
	 * Sets the end date for all active involvements (no end date) in an operation.
	 * @param orgId
	 * @param operationId
	 * @param end
	 * @param uow
	 */
	setEndOfAllActive(
		orgId: string,
		operationId: string,
		end: Date,
		uow?: DbSessionProvider,
	): Promise<void>;

	/**
	 * Removes all pending involvements in an operation.
	 * @param orgId The organization ID.
	 * @param operationId The operation ID.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	removeAllPending(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<void>;

	/**
	 * Creates multiple unit involvements within an operation.
	 * @param orgId The organization ID.
	 * @param operationId The operation ID.
	 * @param involvement Array of involvement data to be created.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	createInvolvements(
		orgId: string,
		operationId: string,
		involvement: CreateUnitInvolvementDto[],
		uow?: DbSessionProvider,
	): Promise<void>;

	/**
	 * Finds a unit's involvement within an operation based on a time range.
	 * @param orgId The organization ID.
	 * @param unitId The unit ID.
	 * @param start The start date of the involvement period.
	 * @param end The end date of the involvement period. If the involvement should be ongoing, set to `null`.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	findByUnitInvolvementTimeRange(
		orgId: string,
		unitId: string,
		start: Date,
		end: Date | null,
		uow?: DbSessionProvider,
	): Promise<UnitInvolvement | undefined>;

	/**
	 * Finds all involvements of units without an end time or pending state in an operation.
	 * @param orgId The organization ID.
	 * @param operationId The operation ID.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	findOperationOngoingInvolvements(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<UnitInvolvement[]>;

	/**
	 * Finds an involvement of a pending unit.
	 * @param orgId The organization ID.
	 * @param unitId The unit ID.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	findInvolvementOfPendingUnit(
		orgId: string,
		unitId: string,
		uow?: DbSessionProvider,
	): Promise<UnitInvolvement | undefined>;

	/**
	 * Finds a specific involvement of a unit in an operation.
	 * @param orgId The organization ID.
	 * @param operationId The operation ID.
	 * @param unitId The unit ID.
	 * @param alertGroupId The alert group ID, if the unit is part of an alert group.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	findOperationInvolvement(
		orgId: string,
		operationId: string,
		unitId: string,
		alertGroupId: string | null,
		uow?: DbSessionProvider,
	): Promise<UnitInvolvement | undefined>;

	findOperationInvolvements(
		orgId: string,
		operationId: string,
		uow?: DbSessionProvider,
	): Promise<UnitInvolvement[]>;

	/**
	 * Adds a involvement time range with a start date to a pending unit's involvement in an operation.
	 * @param orgId The organization ID.
	 * @param operationId The operation ID.
	 * @param unitId The unit ID.
	 * @param start The start date of the involvement.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	addStartOfPendingUnit(
		orgId: string,
		operationId: string,
		unitId: string,
		start: Date,
		uow?: DbSessionProvider,
	): Promise<void>;

	/**
	 * Sets the end date for a unit's involvement in an operation.
	 * @param orgId The organization ID.
	 * @param operationId The operation ID.
	 * @param unitId The unit ID.
	 * @param alertGroupId The alert group ID, if the unit is part of an alert group.
	 * @param end The end date of the involvement.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	setEnd(
		orgId: string,
		operationId: string,
		unitId: string,
		alertGroupId: string | null,
		end: Date,
		uow?: DbSessionProvider,
	): Promise<void>;

	/**
	 * Sets the end date for a unit's involvement in an operation.
	 * @param orgId The organization ID.
	 * @param operationId The operation ID.
	 * @param unitId The unit ID.
	 * @param alertGroupId The alert group ID, if the unit is part of an alert group.
	 * @param isPending The pending state of the unit.
	 * @param uow Optional unit of work for transactional consistency.
	 */
	setPendingState(
		orgId: string,
		operationId: string,
		unitId: string,
		alertGroupId: string | null,
		isPending: boolean,
		uow?: DbSessionProvider,
	): Promise<void>;

	setDeletedFlag(
		orgId: string,
		operationId: string,
		deleted: boolean,
		uow?: DbSessionProvider,
	): Promise<void>;
}
