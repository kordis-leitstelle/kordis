import { Role } from '@kordis/shared/auth';

/*
 * Key: Role
 * Value: Set of roles that are included/inherited by this role, including itself.
 * Can also be read as: Organization Admin > Admin > User
 */
export const ROLE_HIERARCHY = Object.freeze({
	[Role.ORGANIZATION_ADMIN]: new Set([
		Role.ORGANIZATION_ADMIN,
		Role.ADMIN,
		Role.USER,
	]),
	[Role.ADMIN]: new Set([Role.ADMIN, Role.USER]),
	[Role.USER]: new Set([Role.USER]),
});

export function isRoleAllowed(userRole: Role, minimumRole: Role): boolean {
	return ROLE_HIERARCHY[userRole].has(minimumRole);
}
