export interface ServiceStatusReport {
	status: 'up' | 'down' | 'maintenance' | 'maintenance_scheduled';
	message: string;
	url?: string;
}
