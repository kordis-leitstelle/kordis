import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApolloError } from '@apollo/client/core';
import { GraphQLFormattedErrorExtensions } from 'graphql/error';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, catchError, map, tap } from 'rxjs';

import { GraphqlService, gql } from '@kordis/spa/core/graphql';
import { SHARED_TOKENS } from '@kordis/spa/core/misc';

@Injectable({
	providedIn: 'root',
})
export class OperationActionsService {
	private readonly gqlService = inject(GraphqlService);
	private readonly http = inject(HttpClient);
	private readonly apiUrl = inject(SHARED_TOKENS.API_URL);
	private readonly notificationService = inject(NzNotificationService);

	// eslint-disable-next-line @smarttools/rxjs/finnish
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
						'Gelöscht',
						'Der Einsatz wurde erfolgreich gelöscht',
					),
				),
				map(() => true),
				catchError((error: unknown) => {
					this.notificationService.error(
						'Fehler',
						'Der Einsatz konnte nicht gelöscht werden',
					);
					throw error;
				}),
			);
	}

	// eslint-disable-next-line @smarttools/rxjs/finnish
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
				catchError((error: unknown) => {
					if (
						error instanceof ApolloError &&
						(error.cause?.extensions as GraphQLFormattedErrorExtensions)
							.code === 'VALIDATION_EXCEPTION'
					) {
						this.notificationService.error(
							'Archivierung fehlgeschlagen',
							`
								<ul>
								${((error.cause?.extensions as GraphQLFormattedErrorExtensions).errors as [])
									.flatMap(({ errors }) => errors)
									.map((error) => `<li>${error}</li>`)
									.join('')}
								</ul>
							`,
							{
								nzDuration: 15 * 1000,
							},
						);
					} else {
						this.notificationService.error(
							'Fehler',
							'Der Einsatz konnte nicht archiviert werden',
						);
					}

					throw error;
				}),
			);
	}

	// eslint-disable-next-line @smarttools/rxjs/finnish
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
					const _url = URL.createObjectURL(data);
					window.open(_url, '_blank')?.print();
					URL.revokeObjectURL(_url);
				}),
				map(() => undefined),
			);
	}
}
