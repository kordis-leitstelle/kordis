import { InjectionToken } from '@angular/core';

export const SHARED_TOKENS = Object.freeze({
	API_URL: new InjectionToken<string>('API_URL'),
});
