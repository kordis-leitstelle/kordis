import { DatePipe } from '@angular/common';
import { Inject, inject, Injectable } from '@angular/core';
import {
	concatAll,
	map,
	Observable,
	ReplaySubject,
	scan,
	shareReplay,
} from 'rxjs';

import { ServiceHealthService } from './service-health.service';
import { ServiceStatusReport } from '../models/service-status-report.model';

const IMPACT_MAP: Readonly<Record<string, string>> = Object.freeze({
	DEGRADEDPERFORMANCE: 'Leistungseinbußen',
	PARTIALOUTAGE: 'Teilausfall',
	OPERATIONAL: 'Funktionsfähig',
	UNDERMAINTENANCE: 'Wartung',
	MAJOROUTAGE: 'Großer Ausfall',
});

interface InstatusIncident {
	name: string;
	started: string;
	status: string;
	impact: string;
	url: string;
}

interface InstatusMaintenance {
	name: string;
	start: string;
	status: string;
	duration: string;
	url: string;
}

interface InstatusResponse {
	activeIncidents?: InstatusIncident[];
	activeMaintenances: InstatusMaintenance[];
}

@Injectable()
export class InstatusServiceHealthService implements ServiceHealthService {
	private readonly datePipe = inject(DatePipe);
	private readonly instatusChangedSubject$ =
		new ReplaySubject<InstatusResponse>(1);

	serviceStatusChanged$: Observable<ServiceStatusReport> =
		this.instatusChangedSubject$.pipe(
			scan(
				(acc, curr) => {
					// we have interest in all active incidents that are not already in the accumulator or have a different status
					acc.incidents =
						curr.activeIncidents?.filter(
							(report) =>
								!acc.incidents.some(
									(i) => i.name === report.name && i.status === report.status,
								),
						) ?? [];

					acc.maintenances =
						curr.activeMaintenances?.filter(
							(report) =>
								!acc.maintenances.some(
									(i) => i.name === report.name && i.status === report.status,
								),
						) ?? [];

					return acc;
				},
				{
					incidents: [] as InstatusIncident[],
					maintenances: [] as InstatusMaintenance[],
				},
			),
			map((response) => [
				...(response.incidents
					? response.incidents.map((incident: InstatusIncident) =>
							this.mapIncidentToReport(incident),
					  )
					: []),
				...(response.maintenances
					? response.maintenances.map((maintenance: InstatusMaintenance) =>
							this.mapMaintenanceToReport(maintenance),
					  )
					: []),
			]),
			shareReplay({ bufferSize: 1, refCount: true }),
			concatAll(),
		);

	constructor(
		@Inject('instatusUrl') instatusUrl: string,
		@Inject('checkIntervalMs') checkIntervalMs: number,
	) {
		this.startWorker(instatusUrl, checkIntervalMs);
	}

	private startWorker(instatusUrl: string, checkIntervalMs: number): void {
		const blob = new Blob(
			[
				`
          let latestState = "";
					const checkForChanges = async () => {
						const response = await fetch('${instatusUrl}/summary.json', {cache: "no-store"});
            const currentState = await response.text();

						if (currentState !== latestState) {
							latestState = currentState;
							self.postMessage(JSON.parse(currentState));
						}
					};
					checkForChanges();
					setInterval(checkForChanges, ${checkIntervalMs});
      `,
			],
			{ type: 'application/javascript' },
		);

		const url = URL.createObjectURL(blob);

		const instatusStateChangeWorker = new Worker(url);

		instatusStateChangeWorker.onmessage = ({ data }) => {
			this.instatusChangedSubject$.next(data);
		};
	}

	private mapMaintenanceToReport(
		maintenance: InstatusMaintenance,
	): ServiceStatusReport {
		switch (maintenance.status) {
			case 'NOTSTARTEDYET':
				return {
					message: `${maintenance.name} - am ${this.dateStringToShortDateString(
						maintenance.start,
					)} für ${maintenance.duration} Minuten.`,
					status: 'maintenance_scheduled',
					url: maintenance.url,
				};
			case 'INPROGRESS': {
				const maintenanceEnd = new Date(maintenance.start);
				maintenanceEnd.setMinutes(
					maintenanceEnd.getMinutes() + Number(maintenance.duration),
				);

				return {
					message: `${
						maintenance.name
					} - bis ${this.dateStringToShortDateString(
						maintenanceEnd.toISOString(),
					)}`,
					status: 'maintenance',
					url: maintenance.url,
				};
			}

			case 'COMPLETED':
				return {
					message: maintenance.name,
					status: 'up',
					url: maintenance.url,
				};
		}

		return {
			message: maintenance.name,
			status: 'maintenance',
			url: maintenance.url,
		};
	}

	private mapIncidentToReport(incident: InstatusIncident): ServiceStatusReport {
		switch (incident.status) {
			case 'INVESTIGATING':
			case 'IDENTIFIED':
				return {
					message:
						`${incident.name}. Auswirkung: ` + IMPACT_MAP[incident.impact],
					status: 'down',
					url: incident.url,
				};
			case 'MONITORING':
			case 'RESOLVED':
				return {
					message: incident.name,
					status: 'up',
					url: incident.url,
				};
		}

		return {
			message: incident.name,
			status: 'down',
			url: incident.url,
		};
	}

	private dateStringToShortDateString(dateString: string): string | null {
		return this.datePipe.transform(new Date(dateString), 'HH:mm dd.MM.');
	}
}
