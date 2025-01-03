import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, catchError, map, tap } from 'rxjs';
import { SHARED_TOKENS } from 'spa/core/misc';

import { GraphqlService, gql } from '@kordis/spa/core/graphql';


@Injectable({
	providedIn: 'root',
})
export class OperationActionsService {
	private readonly gqlService = inject(GraphqlService);
	private readonly http = inject(HttpClient);
	private readonly apiUrl = inject(SHARED_TOKENS.API_URL);
	private readonly notificationService = inject(NzNotificationService);

	deleteOperation(operationId: string): Observable<boolean> {
		return this.gqlService
			.mutate$(
				gql`
					mutation DeleteOperation($id: String!) {
						deleteOperation(id: $id)
					}
				`,
				{
					id: operationId,
				},
			)
			.pipe(
				tap(() =>
					this.notificationService.success(
						'Archiviert',
						'Der Einsatz wurde erfolgreich gelöscht',
					),
				),
				map(() => true),
				catchError((error) => {
					this.notificationService.error(
						'Fehler',
						'Der Einsatz konnte nicht gelöscht werden',
					);
					throw error;
				}),
			);
	}

	archiveOperation(operationId: string): Observable<boolean> {
		return this.gqlService
			.mutate$(
				gql`
					mutation ArchiveOperation($id: String!) {
						archiveOperation(id: $id)
					}
				`,
				{
					id: operationId,
				},
			)
			.pipe(
				tap(() =>
					this.notificationService.success(
						'Archiviert',
						'Der Einsatz wurde erfolgreich archiviert',
					),
				),
				map(() => true),
				catchError((error) => {
					this.notificationService.error(
						'Fehler',
						'Der Einsatz konnte nicht archiviert werden',
					);
					throw error;
				}),
			);
	}

	createAndOpenPdf(operationId: string): Observable<void> {
		return this.http
			.get(`${this.apiUrl}/operation/${operationId}.pdf`, {
				headers: {
					Accept: 'application/pdf',
				},
				responseType: 'blob',
			})
			.pipe(
				tap((data) => {
					const _url = window.URL.createObjectURL(data);
					window.open(_url, '_blank')?.focus();
				}),
				map(() => undefined),
			);
	}
}
