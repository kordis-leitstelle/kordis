import { CommonModule, DatePipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	Signal,
	computed,
	inject,
	signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import '@ant-design/icons-angular';
import {
	DeleteOutline,
	FilePdfOutline,
	FileZipOutline,
	PlusOutline,
	WarningOutline,
} from '@ant-design/icons-angular/icons';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';
import { NzIconDirective, NzIconService } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { catchError, map } from 'rxjs';

import { Operation, Query } from '@kordis/shared/model';
import { GraphqlService, gql } from '@kordis/spa/core/graphql';

import { OperationActionsService } from '../service/operation-actions.service';
import { SelectedOperationIdStateService } from '../service/selected-operation-id-state.service';
import { TabsFormStateService } from '../service/tabs-form-state.service';
import { CreateOperationModalComponent } from './modals/create-operation-modal.component';
import { OperationDetailComponent } from './operation-detail/operation-detail.component';
import { OperationSelectComponent } from './operation-select.component';

@Component({
	selector: 'krd-operations',
	standalone: true,
	imports: [
		CommonModule,
		OperationDetailComponent,
		NzIconDirective,
		OperationSelectComponent,
		NzButtonComponent,
		NzTooltipDirective,
		NzDividerComponent,
		NzEmptyComponent,
		NzPopconfirmModule,
		NzSpinComponent,
	],
	providers: [SelectedOperationIdStateService, TabsFormStateService, DatePipe],
	templateUrl: './operation.component.html',
	styleUrl: './operation.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationComponent {
	selectedOperation = signal<Operation | null>(null);
	readonly hasOperationSelection = computed(() => !!this.selectedOperation());
	readonly selectedOperationId = computed(() => this.selectedOperation()?.id);
	readonly actionsLoadingState = signal<'PDF' | 'DELETE' | 'ARCHIVE' | null>(
		null,
	);

	readonly operations: Signal<Operation[]>;

	private readonly operationActionsService = inject(OperationActionsService);
	private readonly modalService = inject(NzModalService);
	private readonly gqlService = inject(GraphqlService);
	private readonly formStateService = inject(TabsFormStateService);
	private readonly selectedOperationIdStateService = inject(
		SelectedOperationIdStateService,
	);

	constructor(iconService: NzIconService) {
		iconService.addIcon(
			PlusOutline,
			DeleteOutline,
			FileZipOutline,
			WarningOutline,
			FilePdfOutline,
		);
		const queryRef = this.gqlService.query<{ operations: Query['operations'] }>(
			gql`
				query {
					operations(
						filter: { processStates: [ACTIVE, COMPLETED] }
						sortBySignAsc: true
					) {
						id
						sign
						alarmKeyword
						start
						location {
							address {
								name
								street
								city
								postalCode
							}
						}
					}
				}
			`,
		);
		this.operations = toSignal(
			queryRef.$.pipe(
				catchError((err) => {
					console.log(JSON.stringify(err));
					throw err;
				}),
				map(({ operations }) => operations),
			),
			{ initialValue: [] },
		);
	}

	openCreateOperationModal(): void {
		this.modalService
			.create({
				nzContent: CreateOperationModalComponent,
				nzFooter: null,
				nzNoAnimation: true,
				nzWidth: 550,
			})
			.afterClose.subscribe((result) => {
				if (result.operationId) {
					this.selectedOperationIdStateService.selectedOperationId.set(
						result.operationId,
					);
				}
			});
	}

	createAndOpenPdf(): void {
		this.actionsLoadingState.set('PDF');
		this.operationActionsService
			.createAndOpenPdf(this.selectedOperationId()!)
			.subscribe()
			.add(() => this.actionsLoadingState.set(null));
	}

	deleteOperation(): void {
		this.actionsLoadingState.set('DELETE');
		this.operationActionsService
			.deleteOperation(this.selectedOperationId()!)
			.subscribe(() => this.selectNextOrNone())
			.add(() => this.actionsLoadingState.set(null));
	}

	archiveOperation(): void {
		this.actionsLoadingState.set('ARCHIVE');
		this.operationActionsService
			.archiveOperation(this.selectedOperationId()!)
			.subscribe(() => this.selectNextOrNone())
			.add(() => this.actionsLoadingState.set(null));
	}

	safelySelectOperation(operationId?: string): void {
		if (!operationId) {
			this.selectedOperation.set(null);
			this.selectedOperationIdStateService.selectedOperationId.set(null);
			this.formStateService.reset();
			return;
		}
		console.log(
			'safelySelectOperation',
			this.formStateService.getState('baseData').state(),
		);
		console.log('safelySelectOperation', this.formStateService.hasError());
		if (this.formStateService.hasError()) {
			this.modalService.confirm({
				nzTitle: 'Bestätigung erforderlich',
				nzContent: `Das aktuelle Einsatzprotokoll konnte nicht gespeichert werden, trotzdem auf <i>${this.selectedOperation()?.sign}</i> wechseln?`,
				nzOkText: 'Ja',
				nzCancelText: 'Nein',
				nzOnOk: () => {
					this.selectedOperationIdStateService.selectedOperationId.set(
						this.selectedOperationId() ?? null,
					);
					this.formStateService.reset();
				},
				nzOnCancel: () =>
					this.selectedOperation.set(
						this.operations().find(
							({ id }) =>
								id ===
								this.selectedOperationIdStateService.selectedOperationId(),
						) ?? null,
					),
			});
		} else {
			// to reduce complexity, we just pass the selected operation id to the state service instead of registering the state service signal here leading to having to create separate interfaces
			this.selectedOperationIdStateService.selectedOperationId.set(operationId);
			this.formStateService.reset();
		}
	}

	private selectNextOrNone(): void {
		if (this.operations().length) {
			this.selectedOperation.set(
				this.operations()[this.operations().length - 1],
			);
		} else {
			this.selectedOperation.set(null);
		}
	}
}
