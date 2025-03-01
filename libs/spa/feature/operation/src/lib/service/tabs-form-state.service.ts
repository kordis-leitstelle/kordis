import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

export enum FormState {
	LOADING,
	SAVED,
	ERROR,
}

export interface TabFormState {
	latestSave: Signal<Date | null>;
	state: Signal<FormState | null>;
	error: Signal<string | null>;
}

export type Tabs = keyof TabsFormState;

interface WritableTabFormState {
	latestSave: WritableSignal<Date | null>;
	state: WritableSignal<FormState | null>;
	error: WritableSignal<string | null>;
}

interface TabsFormState {
	baseData: WritableTabFormState;
	description: WritableTabFormState;
	patients: WritableTabFormState;
	involvements: WritableTabFormState;
	categories: WritableTabFormState;
}

@Injectable()
export class TabsFormStateService {
	private readonly tabs: TabsFormState = {
		baseData: this.makeInitState(),
		description: this.makeInitState(),
		patients: this.makeInitState(),
		involvements: this.makeInitState(),
		categories: this.makeInitState(),
	};

	getState(tab: Tabs): TabFormState {
		return {
			latestSave: this.tabs[tab].latestSave.asReadonly(),
			state: this.tabs[tab].state.asReadonly(),
			error: this.tabs[tab].error.asReadonly(),
		};
	}

	setLoading(tab: Tabs): void {
		this.tabs[tab].state.set(FormState.LOADING);
		this.tabs[tab].error.set(null);
	}

	setSaved(tab: Tabs): void {
		this.tabs[tab].state.set(FormState.SAVED);
		this.tabs[tab].latestSave.set(new Date());
		this.tabs[tab].error.set(null);
	}

	setError(tab: Tabs, error: string): void {
		this.tabs[tab].state.set(FormState.ERROR);
		this.tabs[tab].error.set(error);
	}

	/*
	 * Resets the state of all tabs to null.
	 */
	reset(): void {
		for (const tab in this.tabs) {
			this.tabs[tab as Tabs].state.set(null);
			this.tabs[tab as Tabs].latestSave.set(null);
			this.tabs[tab as Tabs].error.set(null);
		}
	}

	/*
	 * Sets all tab states to Saved without a latest save date.
	 */
	setInitial(): void {
		for (const tab in this.tabs) {
			this.tabs[tab as Tabs].state.set(FormState.SAVED);
			this.tabs[tab as Tabs].latestSave.set(null);
			this.tabs[tab as Tabs].error.set(null);
		}
	}

	hasError(): boolean {
		return Object.values(this.tabs).some(
			(tab) => tab.state() === FormState.ERROR,
		);
	}

	private makeInitState(): WritableTabFormState {
		return {
			state: signal<FormState | null>(null),
			error: signal<string | null>(null),
			latestSave: signal<Date | null>(null),
		};
	}
}
