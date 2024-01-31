import { All, Controller, HttpCode } from '@nestjs/common';

@Controller('health-check')
export class HealthCheckController {
	@All()
	@HttpCode(200)
	healthCheck(): Promise<void> {
		return Promise.resolve();
	}
}
