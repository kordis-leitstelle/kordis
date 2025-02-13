import { CommonModule, DatePipe } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	Signal,
	TemplateRef,
	ViewChild,
	computed,
	inject,
	signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
import { filter, first, map, merge, switchMap } from 'rxjs';

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
	templateUrl: './operations.component.html',
	styleUrl: './operations.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsComponent implements AfterViewInit {
	@ViewChild('archiveError', { static: false })
	archiveErrorRef?: TemplateRef<object>;
	// these signals are for the selection component, the actual selected component which is shown in the tab components is managed in the id state service
	selectedOperation = signal<Operation | null>(null);
	readonly selectedOperationId = computed(() => this.selectedOperation()?.id);
	readonly actionsLoadingState = signal<'PDF' | 'DELETE' | 'ARCHIVE' | null>(
		null,
	);
	readonly operations: Signal<Operation[]>;
	protected readonly formStateService = inject(TabsFormStateService);
	private readonly operationActionsService = inject(OperationActionsService);
	private readonly modalService = inject(NzModalService);
	private readonly gqlService = inject(GraphqlService);
	private readonly selectedOperationIdStateService = inject(
		SelectedOperationIdStateService,
	);
	// use the state service to ensure no race condition between the selection component and the tab components
	readonly hasOperationSelection = computed(
		() => !!this.selectedOperationIdStateService.selectedOperationId(),
	);
	private readonly refetchOperations: () => Promise<{
		operations: Operation[];
	}>;

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

		this.refetchOperations = queryRef.refresh;

		this.refetchOnCreationOrChange();

		this.operations = toSignal(
			queryRef.$.pipe(map(({ operations }) => operations)),
			{ initialValue: [] },
		);

		// default select first operation
		queryRef.$.pipe(first()).subscribe(({ operations }) => {
			this.formStateService.setInitial();
			this.selectedOperation.set(operations?.[0]);
			this.selectedOperationIdStateService.selectedOperationId.set(
				operations?.[0]?.id,
			);
		});
	}

	ngAfterViewInit(): void {
		this.operationActionsService.setNotificationTemplates({
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			archiveError: this.archiveErrorRef!,
		});
	}

	openCreateOperationModal(): void {
		this.modalService
			.create({
				nzContent: CreateOperationModalComponent,
				nzFooter: null,
				nzNoAnimation: true,
				nzWidth: 550,
			})
			.afterClose.pipe(
				filter((result) => result?.operationId), // operation created?
				switchMap(async (opId) =>
					(await this.verifyChangeWithUserOnError()) ? opId : null,
				),
				filter((opId) => !!opId),
				switchMap(() => this.refetchOperations()), // refetch operations to select the new operation, more reliable than waiting for the async event
				map((res) => res.operations[0]),
			)
			.subscribe((op) => {
				// set selected operation (selection component)
				this.selectedOperation.set(op);
				this.selectedOperationIdStateService.selectedOperationId.set(op.id);
				this.formStateService.setInitial();
			});
	}

	createAndOpenPdf(): void {
		this.actionsLoadingState.set('PDF');
		this.operationActionsService
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			.createAndOpenPdf(this.selectedOperationId()!)
			.subscribe()
			.add(() => this.actionsLoadingState.set(null));
	}

	deleteOperation(): void {
		this.actionsLoadingState.set('DELETE');
		this.operationActionsService
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			.deleteOperation(this.selectedOperationId()!)
			.pipe(switchMap(() => this.refetchOperations()))
			.subscribe(() => this.selectNextOrNone())
			.add(() => this.actionsLoadingState.set(null));
	}

	archiveOperation(): void {
		this.actionsLoadingState.set('ARCHIVE');
		this.operationActionsService
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			.archiveOperation(this.selectedOperationId()!)
			.pipe(switchMap(() => this.refetchOperations()))
			.subscribe(() => this.selectNextOrNone())
			.add(() => this.actionsLoadingState.set(null));
	}

	async onUserSelectedOperation(operationId?: string): Promise<void> {
		// if no op selected, reset everything
		if (!operationId) {
			this.selectedOperation.set(null);
			this.selectedOperationIdStateService.selectedOperationId.set(null);
			this.formStateService.reset();
			return;
		}

		// if there is currently an error, ask if a change is really wanted
		if (await this.verifyChangeWithUserOnError()) {
			this.selectedOperationIdStateService.selectedOperationId.set(operationId);
			this.formStateService.setInitial();
		} else {
			// if a change is rejected, we need to reset the selected operation to the previous one (this only changes the selection in the select component)
			this.selectedOperation.set(
				this.operations().find(
					({ id }) =>
						id === this.selectedOperationIdStateService.selectedOperationId(),
				) ?? null,
			);
		}
	}

	private refetchOnCreationOrChange(): void {
		merge(
			this.gqlService.subscribe$(gql`
				subscription {
					operationCreated {
						id
					}
				}
			`),
			this.gqlService.subscribe$(gql`
				subscription {
					operationDeleted {
						operationId
					}
				}
			`),
		)
			.pipe(takeUntilDestroyed())
			.subscribe(() => this.refetchOperations());
	}

	private async verifyChangeWithUserOnError(): Promise<boolean> {
		if (this.formStateService.hasError()) {
			return new Promise((resolve) =>
				this.modalService.confirm({
					nzTitle: 'Bestätigung erforderlich',
					nzContent:
						'Das aktuelle Einsatzprotokoll konnte nicht gespeichert werden, trotzdem auf das neue Protokoll wechseln?',
					nzOkText: 'Ja',
					nzCancelText: 'Nein',
					nzOnOk: () => {
						resolve(true);
					},
					nzOnCancel: () => resolve(false),
				}),
			);
		}

		return true;
	}

	private selectNextOrNone(): void {
		if (this.operations().length) {
			const nextOp = this.operations()[0];

			this.selectedOperation.set(nextOp);
			this.selectedOperationIdStateService.selectedOperationId.set(nextOp.id);
		} else {
			this.selectedOperation.set(null);
			this.selectedOperationIdStateService.selectedOperationId.set(null);
		}
	}
}
