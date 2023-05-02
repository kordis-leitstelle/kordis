import { Injectable } from '@nestjs/common';

import { Trace } from '@kordis/api/observability';

@Injectable()
export class AppService {
	@Trace()
	getData(): { message: string } {
		return { message: 'Welcome to api!' };
	}
}
