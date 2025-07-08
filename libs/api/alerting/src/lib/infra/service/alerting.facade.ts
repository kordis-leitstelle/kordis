import { Inject, Injectable } from '@nestjs/common';

import { OperationViewModel } from '@kordis/api/operation';

import { AlertService } from '../../core/alert.service';
import {
	DiveraOrgConfig,
	ProviderConfigs,
} from '../../core/entity/alert-org-config.entity';
import {
	ALERT_GROUP_CONFIG_REPOSITORY,
	AlertGroupConfigRepository,
} from '../../core/repo/alert-group-config.repository';
import {
	ALERT_ORG_CONFIG_REPOSITORY,
	AlertOrgConfigRepository,
} from '../../core/repo/alert-org-config.repository';
import { AlertingProviders } from '../schema/alerting-org-config.schema';
import { AlertingProvider } from './alert-provider/provider.interface';

@Injectable()
export class AlertingFacade implements AlertService {
	private readonly providers: Readonly<
		Record<AlertingProviders, AlertingProvider>
	>;

	constructor(
		@Inject(ALERT_ORG_CONFIG_REPOSITORY)
		private readonly configRepo: AlertOrgConfigRepository,
		@Inject(ALERT_GROUP_CONFIG_REPOSITORY)
		private readonly alertGroupConfigRepo: AlertGroupConfigRepository,
		@Inject('ALERT_PROVIDERS') providers: AlertingProvider[],
	) {
		this.providers = Object.fromEntries(
			providers.map((provider) => [provider.provider, provider]),
		) as Readonly<Record<AlertingProviders, AlertingProvider>>;
	}

	async alertWithOperation(
		alertGroupIds: string[],
		operation: OperationViewModel,
		hasPriority: boolean,
		orgId: string,
	): Promise<void> {
		const [provider, config] = await this.getProviderConfig(orgId);
		const alertGroupConfigs =
			await this.alertGroupConfigRepo.getAlertGroupConfigs(
				alertGroupIds,
				orgId,
			);

		await provider.alertWithOperation(
			alertGroupConfigs,
			operation,
			hasPriority,
			config,
		);
	}

	async getProviderConfig(
		orgId: string,
	): Promise<[AlertingProvider, ProviderConfigs]> {
		const config = await this.configRepo.findByOrgId(orgId);
		if (config instanceof DiveraOrgConfig) {
			return [this.providers[AlertingProviders.DIVERA], config];
		} else if (config === 'MOCK') {
			return [this.providers[AlertingProviders.MOCK], config];
		}
		throw new Error('Unknown Alerting Provider');
	}
}
