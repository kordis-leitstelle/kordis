import { AlarmBuilder, DiveraClient } from 'divera247-api-unofficial';

import { OperationViewModel } from '@kordis/api/operation';

import { AlertGroupDiveraConfig } from '../../../core/entity/alert-group-config.entity';
import { DiveraOrgConfig } from '../../../core/entity/alert-org-config.entity';
import { DiveraRequestFailedError } from '../../error/divera-request-failed.error';
import { AlertingProviders } from '../../schema/alerting-org-config.schema';
import { AlertingProvider } from './provider.interface';

export class DiveraProvider implements AlertingProvider {
	readonly provider = AlertingProviders.DIVERA;

	async alertWithOperation(
		alertGroupConfigs: AlertGroupDiveraConfig[],
		operation: OperationViewModel,
		hasPriority: boolean,
		config: DiveraOrgConfig,
	): Promise<void> {
		const client = new DiveraClient(config.token);
		let alarmBuilder = new AlarmBuilder()
			.address(this.getAddress(operation.location))
			.details(operation.alarmKeyword, operation.description)
			.foreignId(`KORDIS-${operation.sign}`)
			.groups(
				alertGroupConfigs.map(({ diveraGroupId }) => diveraGroupId),
				'id',
			)
			.sendPush()
			.sendMail();

		if (operation.location.coordinate) {
			alarmBuilder = alarmBuilder.coordinates(
				operation.location.coordinate.lat,
				operation.location.coordinate.lon,
			);
		}

		if (hasPriority) {
			alarmBuilder = alarmBuilder.isPriority();
		}

		const resp = await client.createAlarm(alarmBuilder.build());

		if (!resp.success) {
			throw new DiveraRequestFailedError(resp);
		}
	}

	private getAddress(location: OperationViewModel['location']): string {
		const streetPart = location?.address?.street
			? `${location.address.name} ${location.address.street}`.trim()
			: '';

		const cityPart = [location?.address?.postalCode, location?.address?.city]
			.filter(Boolean)
			.join(' ');

		return [streetPart, cityPart].filter(Boolean).join(', ');
	}
}
