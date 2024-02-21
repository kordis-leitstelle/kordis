import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { DynamicConfig } from './environments/dynamic-config.model';
import { environment } from './environments/environment';

fetch('./assets/config.json')
	.then((response) => response.json())
	.then((config: unknown) => {
		Object.assign(environment, {
			...(config as DynamicConfig),
			...environment,
		});
	})
	// we have to dynamically import the module, so the environment does not get evaluated before the fetch
	.then(() => import('./app/app.module'))
	.then(({ AppModule }) => platformBrowserDynamic().bootstrapModule(AppModule))
	// eslint-disable-next-line no-console
	.catch((err) => console.error(err));
