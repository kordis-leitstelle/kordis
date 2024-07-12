import { NgClass } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
} from '@angular/core';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { STATUS_EXPLANATIONS } from '../../status-explanations';

@Component({
	selector: 'krd-status-badge',
	standalone: true,
	imports: [NzTooltipDirective, NgClass],
	template: `
		@if (hasStatus()) {
			<span
				[nz-tooltip]="STATUS_EXPLANATIONS[status()!]"
				[ngClass]="'status-' + status()"
				>{{ status() }}</span
			>
		} @else {
			<span
				nz-tooltip="Die Einheit hat noch keinen Status abgegeben, seitdem sie einem Einsatz zugeordnet wurde."
				class="no-status"
				>?</span
			>
		}
	`,
	styles: `
		span {
			height: 23px;
			width: 23px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.no-status {
			background-color: var(--ant-primary-1);
			color: #000000;
		}

		.status-1 {
			background-color: var(--ant-success-color);
			color: #000000;
		}

		.status-2 {
			background-color: var(--ant-success-color-active);
			color: #ffffff;
		}

		.status-3 {
			background-color: var(--ant-warning-color);
			color: #000000;
		}

		.status-4 {
			background-color: var(--ant-error-color);
			color: #ffffff;
		}

		.status-6 {
			background-color: var(--ant-error-color-outline);
			color: #000000;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
	readonly status = input.required<number | undefined | null>();
	readonly hasStatus = computed(() => this.status() != null);
	protected readonly STATUS_EXPLANATIONS = STATUS_EXPLANATIONS;
}
