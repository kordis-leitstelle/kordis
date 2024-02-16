import { Role } from './role.enum';

export default interface AuthUser {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: Role;
	organizationId: string;
}
