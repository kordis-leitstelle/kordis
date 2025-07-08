import { OperationViewModel } from '@kordis/api/operation';

import { AlertGroupDiveraConfig } from '../../../core/entity/alert-group-config.entity';
import { ProviderConfigs } from '../../../core/entity/alert-org-config.entity';
import { AlertingProviders } from '../../schema/alerting-org-config.schema';

export interface AlertingProvider {
	readonly provider: AlertingProviders;

	alertWithOperation(
		alertGroupConfigs: AlertGroupDiveraConfig[],
		operation: OperationViewModel,
		hasPriority: boolean,
		config: ProviderConfigs,
	): Promise<void>;
}
