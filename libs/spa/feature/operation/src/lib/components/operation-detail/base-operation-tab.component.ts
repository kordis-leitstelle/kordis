import { inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { ApolloError, TypedDocumentNode } from '@apollo/client/core';
import {
	OperatorFunction,
	debounceTime,
	delay,
	filter,
	first,
	merge,
	skip,
	switchMap,
	tap,
} from 'rxjs';

import { Operation, Query } from '@kordis/shared/model';
import { GraphqlService } from '@kordis/spa/core/graphql';

import { SelectedOperationIdStateService } from '../../service/selected-operation-id-state.service';
import {
	FormState,
	Tabs,
	TabsFormStateService,
} from '../../service/tabs-form-state.service';

/*
 *	This base class handles the communication with the backend for the operation detail tabs, as well as the form state handling.
 */
export abstract class BaseOperationTabComponent<
	TControl extends AbstractControl = AbstractControl,
> {
	private readonly gqlService = inject(GraphqlService);
	private readonly selectedOperationService = inject(
		SelectedOperationIdStateService,
	);
	private readonly formStateService = inject(TabsFormStateService);

	protected constructor(
		private readonly tabName: Tabs,
		/*
		 * The query to fetch the operation data. Will receive the `operationId` as a variable and expect the operation data as a result.
		 */
		private readonly query: TypedDocumentNode<
			{ operation: Query['operation'] },
			{ operationId: string }
		>,
		/*
		 * The query to fetch the operation data. Will receive the `operationId` and the form value result of the valueChanges pipeline as `formValue` as variables.
		 */
		private readonly mutation: TypedDocumentNode<
			unknown,
			{
				operationId: string;
				formValue: unknown;
			}
		>,
		protected readonly control: TControl,
		/*
		 * Optional Pipeline operators that run on the controls valueChanges right before the mutation is called. The result of the pipeline will be passed as `formValue` to the mutation.
		 */
		private readonly valueChangeOperator?: OperatorFunction<
			typeof control.value,
			unknown
		>,
	) {
		this.watchQuery();
		this.subscribeValueChanges();
		this.subscribeStatusChanges();
	}

	protected abstract setValue(operation: Operation): void;

	/*
	 * Watches the query for changes and updates the form accordingly.
	 */
	private watchQuery(): void {
		const queryRef = this.gqlService.query<{ operation: Query['operation'] }>(
			this.query,
			{
				operationId: this.selectedOperationService.selectedOperationId(),
			},
		);

		merge(
			queryRef.$.pipe(
				first(),
				tap(() => this.formStateService.setLoading(this.tabName)),
			), // load initial
			this.selectedOperationService.selectedOperationId$.pipe(
				// load on operation id change
				skip(1), // first is handled in the initial loading
				tap(() => this.formStateService.setLoading(this.tabName)),
				switchMap((id) => queryRef.refresh({ operationId: id })),
				tap(() => this.control.reset(undefined, { emitEvent: false })),
				takeUntilDestroyed(),
			),
		).subscribe({
			next: ({ operation }) => {
				this.setValue(operation);
				this.formStateService.setSaved(this.tabName);
			},
			error: () =>
				this.formStateService.setError(this.tabName, 'Fehler beim Laden'),
		});
	}

	/*
	 * Subscribes to the valueChanges of the control and sends the mutation to the backend.
	 */
	private subscribeValueChanges(): void {
		let valueChanges$ = this.control.valueChanges.pipe(
			filter(
				() =>
					this.formStateService.getState(this.tabName).state() !==
						FormState.LOADING && // prevent from writing values while the form is loading, e.g. on operation id switch
					this.control.valid,
			),
			debounceTime(300),
		);
		if (this.valueChangeOperator != null) {
			valueChanges$ = valueChanges$.pipe(this.valueChangeOperator);
		}
		valueChanges$
			.pipe(
				tap(() => this.formStateService.setLoading(this.tabName)),
				switchMap((formValue) =>
					this.gqlService.mutate$(this.mutation, {
						operationId: this.selectedOperationService.selectedOperationId(),
						formValue,
					}),
				),
				delay(300), // delay for eye sugar so the saving spinner is visible for a short time
				takeUntilDestroyed(),
			)
			.subscribe({
				next: () => this.formStateService.setSaved(this.tabName),
				error: (e: unknown) => {
					if (e instanceof ApolloError) {
						this.formStateService.setError(this.tabName, e.message);
					} else {
						this.formStateService.setError(this.tabName, 'Unbekannter Fehler');
					}
				},
			});
	}

	private subscribeStatusChanges(): void {
		this.control.statusChanges
			.pipe(
				filter(
					(status) =>
						status === 'INVALID' &&
						this.formStateService.getState(this.tabName).state() !==
							FormState.LOADING,
				),
				takeUntilDestroyed(),
			)
			.subscribe(() =>
				this.formStateService.setError(this.tabName, 'Fehlerhafte Eingabe'),
			);
	}
}
