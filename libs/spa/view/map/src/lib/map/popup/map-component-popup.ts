import { ComponentType } from '@angular/cdk/overlay';
import {
	ComponentRef,
	EmbeddedViewRef,
	InputSignal,
	ViewContainerRef,
} from '@angular/core';
import { Popup, PopupOptions } from 'maplibre-gl';

type InferInputType<T> = T extends InputSignal<infer ST> ? ST : T;

type ComponentInputs<T> = {
	[K in keyof T]?: InferInputType<T[K]>;
};

export abstract class MapPopupComponent {
	popup!: MapComponentPopup<MapPopupComponent>;
}

export class MapComponentPopup<T extends MapPopupComponent> extends Popup {
	private componentRef?: ComponentRef<T>;

	constructor(
		private readonly viewContainerRef: ViewContainerRef,
		options?: PopupOptions,
	) {
		super(options);
	}

	setComponent(
		component: ComponentType<T>,
		componentInputs?: ComponentInputs<T>,
	): typeof this {
		this.componentRef = this.viewContainerRef.createComponent(component, {
			injector: this.viewContainerRef.injector,
		});
		this.componentRef.instance.popup = this;

		if (componentInputs) {
			this.updateComponentInputs(componentInputs);
		}

		const componentElement = (
			this.componentRef.hostView as EmbeddedViewRef<unknown>
		).rootNodes[0] as HTMLElement;

		this.setDOMContent(componentElement);

		return this;
	}

	updateComponentInputs(componentInputs: Partial<ComponentInputs<T>>): void {
		for (const key in componentInputs) {
			this.componentRef?.setInput(key, componentInputs[key]);
		}
	}
}
