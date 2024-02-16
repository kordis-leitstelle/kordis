import { Type } from '@angular/core';

export const loadDashboardView = (): Promise<Type<unknown>> =>
	import('./lib/dashboard.component').then((x) => x.DashboardComponent);
