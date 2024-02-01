import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { DynamicConfig } from './environments/dynamic-config.model';
import { environment } from './environments/environment';

fetch('./assets/config.json')
	.then((response) => response.json())
	.then((config: unknown) => {
		Object.assign(environment, {
			...(config as DynamicConfig),
			...environment,
		});

		platformBrowserDynamic()
			.bootstrapModule(AppModule)
			// eslint-disable-next-line no-console
			.catch((err) => console.error(err));
	});
