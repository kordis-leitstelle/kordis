import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import DOMPurify from 'dompurify';

import { DynamicConfig } from './environments/dynamic-config.model';
import { environment } from './environments/environment';

globalThis.trustedTypes.createPolicy('default', {
	// https://github.com/angular/angular/issues/31329 can't use Angular DomSanitizer here
	createHTML: (s) => {
		return DOMPurify.sanitize(
			s
				// hack so chrome won't complain about inline styles (mainly from svg icons)
				.replace('<style />', ''),
			{
				USE_PROFILES: { html: true, svg: true },
			},
		);
	},
	createScriptURL: (s) => {
		if (
			s === 'ngsw-worker.js' ||
			s.startsWith('blob:' + window.location.origin)
		) {
			return s;
		}
		return '';
	},
});

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
