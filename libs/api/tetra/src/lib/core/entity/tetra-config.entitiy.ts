import { AutoMap } from '@automapper/classes';

export class TetraConfig {
	@AutoMap()
	orgId: string;
	@AutoMap()
	tetraControlApiUrl: string;
	@AutoMap()
	tetraControlApiUserKey: string;
	@AutoMap()
	webhookAccessKey: string;
}
