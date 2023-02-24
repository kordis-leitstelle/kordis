import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import '@total-typescript/ts-reset';

import { AppModule } from './app/app.module';

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err));
