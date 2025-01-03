import { inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { ApolloError, TypedDocumentNode } from '@apollo/client/core';
import {
	OperatorFunction,
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


// this base class handels the communication with the backend for the operation detail tabs
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
			any,
			{
				operationId: string;
				formValue: any;
			}
		>,
		private readonly control: TControl,
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
	}

	protected abstract setValue(operation: Operation): void;

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
				tap(() => console.log('incomming query data')),
			),
			this.selectedOperationService.selectedOperationId$.pipe(
				skip(1), // first is handled in the initial loading
				tap(() => this.formStateService.setLoading(this.tabName)),
				tap(() => console.log('operation id switch loading')),
				switchMap((id) => queryRef.refresh({ operationId: id })),
				tap(() => this.control.reset()),
				takeUntilDestroyed(),
			),
		).subscribe({
			next: ({ operation }) => {
				this.setValue(operation);
				this.formStateService.setSaved(this.tabName);
			},
			error: (e) => {
				console.log(JSON.stringify(e));
				this.formStateService.setError(this.tabName, 'Fehler beim Laden');
			},
		});
	}

	private subscribeValueChanges(): void {
		let valueChanges$ = this.control.valueChanges.pipe(
			tap(() =>
				console.log(
					'value change form state, ',
					this.formStateService.getState(this.tabName).state(),
				),
			),
			filter(
				() =>
					this.formStateService.getState(this.tabName).state() !==
						FormState.LOADING && // prevent from writing values while the form is loading, e.g. on operation id switch
					this.control.valid,
			),
		);
		if (this.valueChangeOperator != null) {
			valueChanges$ = valueChanges$.pipe(this.valueChangeOperator);
		}
		valueChanges$
			.pipe(
				tap(() => console.log('valid value change')),
				tap(() => this.formStateService.setLoading(this.tabName)),
				switchMap((formValue) =>
					this.gqlService.mutate$(this.mutation, {
						operationId: this.selectedOperationService.selectedOperationId(),
						formValue,
					}),
				),
				delay(300), // some eye sugar so the saving spinner is visible for a short time
				takeUntilDestroyed(),
			)
			.subscribe({
				next: () => this.formStateService.setSaved(this.tabName),
				error: (e) => {
					if (e instanceof ApolloError) {
						// todo: show specific error
						console.log(JSON.stringify(e));
						this.formStateService.setError(
							this.tabName,
							'Fehler beim Speichern',
						);
					} else {
						this.formStateService.setError(this.tabName, 'Unbekannter Fehler');
					}
				},
			});

		this.control.statusChanges
			.pipe(
				tap(console.log),
				filter((status) => status === 'INVALID'),
				takeUntilDestroyed(),
			)
			.subscribe(() => {
				console.log('Fehlerhafte Eingabe');
				this.formStateService.setError(this.tabName, 'Fehlerhafte Eingabe');
			});
	}
}
