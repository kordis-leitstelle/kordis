import { Logger } from '@nestjs/common';

import { KordisLogger } from '@kordis/api/observability';
import { OperationViewModel } from '@kordis/api/operation';

import { AlertGroupDiveraConfig } from '../../../core/entity/alert-group-config.entity';
import { ProviderConfigs } from '../../../core/entity/alert-org-config.entity';
import { AlertingProviders } from '../../schema/alerting-org-config.schema';
import { AlertingProvider } from './provider.interface';

export class MockAlertingProvider implements AlertingProvider {
	private readonly logger: KordisLogger = new Logger(MockAlertingProvider.name);
	readonly provider: AlertingProviders = AlertingProviders.MOCK;

	alertWithOperation(
		alertGroupConfigs: AlertGroupDiveraConfig[],
		operation: OperationViewModel,
		hasPriority: boolean,
		config: ProviderConfigs,
	): Promise<void> {
		this.logger.debug(`Alerting with operation called`, {
			alertGroupConfigs,
			operation,
			hasPriority,
			config,
		});
		return Promise.resolve();
	}
}
